import { PrismaClient, RoleLevel, StudentStatus, TermStatus, UserStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()
const developmentPassword = 'Greenfield@2026'

async function main() {
  const school = await prisma.school.upsert({
    where: { registrationNumber: 'MOE/PRI/KE/08421' }, update: {},
    create: { name: 'Greenfield Academy', registrationNumber: 'MOE/PRI/KE/08421', currency: 'KES', timezone: 'Africa/Nairobi', settings: { create: { invoicePrefix: 'INV', receiptPrefix: 'RCT', expenseApprovalLimit: 10000, settings: { country: 'Kenya', county: 'Nairobi', motto: 'Learning today, leading tomorrow' } } } },
  })
  const permissionCodes = ['dashboard.view','students.view','students.manage','fees.view','fees.manage','invoices.generate','payments.view','payments.record','payments.reverse','expenses.view','expenses.create','expenses.approve','budgets.view','budgets.manage','budgets.approve','reports.view','reports.export','audit.view','team.manage','settings.manage']
  for (const code of permissionCodes) await prisma.permission.upsert({ where: { code }, update: {}, create: { code } })
  const permissions = await prisma.permission.findMany()
  const roleDefinitions = [
    { name: 'Administrator', description: 'Full system administration', codes: permissionCodes, level: RoleLevel.APPROVE },
    { name: 'Accountant', description: 'Daily finance operations', codes: permissionCodes.filter(code => !['expenses.approve','budgets.approve','team.manage','settings.manage'].includes(code)), level: RoleLevel.MANAGE },
    { name: 'Principal', description: 'Leadership oversight and approvals', codes: ['dashboard.view','students.view','fees.view','payments.view','expenses.view','expenses.approve','budgets.view','budgets.approve','reports.view','audit.view'], level: RoleLevel.APPROVE },
  ]
  const roles = new Map<string, string>()
  for (const definition of roleDefinitions) {
    const role = await prisma.role.upsert({ where: { schoolId_name: { schoolId: school.id, name: definition.name } }, update: { description: definition.description }, create: { schoolId: school.id, name: definition.name, description: definition.description, isSystem: true } })
    roles.set(role.name, role.id)
    for (const permission of permissions.filter(item => definition.codes.includes(item.code))) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: { level: definition.level }, create: { roleId: role.id, permissionId: permission.id, level: definition.level } })
  }
  const passwordHash = await hash(developmentPassword, 12)
  const staff = [
    { email: 'c.njeri@greenfield.ac.ke', firstName: 'Catherine', lastName: 'Njeri', phone: '+254 712 410 822', role: 'Accountant' },
    { email: 'principal@greenfield.ac.ke', firstName: 'James', lastName: 'Mwangi', phone: '+254 722 840 110', role: 'Principal' },
    { email: 'p.ochieng@greenfield.ac.ke', firstName: 'Peter', lastName: 'Ochieng', phone: '+254 733 204 190', role: 'Administrator' },
  ]
  for (const member of staff) {
    const user = await prisma.user.upsert({ where: { schoolId_email: { schoolId: school.id, email: member.email } }, update: { firstName: member.firstName, lastName: member.lastName, phone: member.phone, status: UserStatus.ACTIVE }, create: { schoolId: school.id, email: member.email, passwordHash, firstName: member.firstName, lastName: member.lastName, phone: member.phone, status: UserStatus.ACTIVE } })
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: roles.get(member.role)! } }, update: {}, create: { userId: user.id, roleId: roles.get(member.role)! } })
  }
  const legacyAdmin = await prisma.user.findUnique({ where: { schoolId_email: { schoolId: school.id, email: 'admin@greenfield.ac.ke' } } })
  if (legacyAdmin?.passwordHash === 'SEED_ONLY_REPLACE_DURING_AUTH_PHASE') await prisma.user.update({ where: { id: legacyAdmin.id }, data: { passwordHash } })
  const year = await prisma.academicYear.upsert({ where: { schoolId_name: { schoolId: school.id, name: '2026' } }, update: {}, create: { schoolId: school.id, name: '2026', startsOn: new Date('2026-01-05'), endsOn: new Date('2026-11-27') } })
  const term = await prisma.term.upsert({ where: { academicYearId_name: { academicYearId: year.id, name: 'Term 2' } }, update: { status: TermStatus.ACTIVE }, create: { academicYearId: year.id, name: 'Term 2', startsOn: new Date('2026-05-06'), endsOn: new Date('2026-08-30'), status: TermStatus.ACTIVE } })
  const classRecords = new Map<string,string>()
  for (const [name, grade] of [['Grade 3 A','Grade 3'],['Grade 4 A','Grade 4'],['Grade 6 A','Grade 6'],['Grade 6 B','Grade 6'],['Grade 7 B','Grade 7'],['Grade 8 A','Grade 8']]) { const record=await prisma.class.upsert({ where: { schoolId_name: { schoolId: school.id, name } }, update: {grade}, create: { schoolId: school.id, name, grade } });classRecords.set(name,record.id) }
  const learners=[
    {admission:'GFA-2024-041',name:'John Kamau',className:'Grade 6 A',guardian:'Mary Wanjiku',phone:'+254 712 345 678',billed:35000,paid:25000},
    {admission:'GFA-2023-018',name:'Amina Hassan',className:'Grade 7 B',guardian:'Hassan Ali',phone:'+254 722 103 445',billed:38500,paid:38500},
    {admission:'GFA-2025-112',name:'Brian Otieno',className:'Grade 4 A',guardian:'Grace Achieng',phone:'+254 733 882 109',billed:32000,paid:12000},
    {admission:'GFA-2022-007',name:'Faith Njeri',className:'Grade 8 A',guardian:'Peter Mwangi',phone:'+254 701 992 230',billed:41000,paid:41000},
    {admission:'GFA-2024-069',name:'Kevin Kiptoo',className:'Grade 6 B',guardian:'Jane Chebet',phone:'+254 711 651 882',billed:35000,paid:28000},
    {admission:'GFA-2025-121',name:'Zawadi Mumo',className:'Grade 3 A',guardian:'Esther Mumo',phone:'+254 724 552 091',billed:29500,paid:29500},
  ]
  for(const learner of learners){
    const [firstName,...lastParts]=learner.name.split(' ');const [guardianFirst,...guardianLast]=learner.guardian.split(' ')
    const guardian=await prisma.guardian.upsert({where:{schoolId_phone:{schoolId:school.id,phone:learner.phone}},update:{firstName:guardianFirst,lastName:guardianLast.join(' ')},create:{schoolId:school.id,firstName:guardianFirst,lastName:guardianLast.join(' '),phone:learner.phone}})
    const student=await prisma.student.upsert({where:{schoolId_admissionNumber:{schoolId:school.id,admissionNumber:learner.admission}},update:{firstName,lastName:lastParts.join(' ')},create:{schoolId:school.id,admissionNumber:learner.admission,firstName,lastName:lastParts.join(' '),status:StudentStatus.ACTIVE}})
    await prisma.studentGuardian.upsert({where:{studentId_guardianId:{studentId:student.id,guardianId:guardian.id}},update:{isPrimary:true},create:{studentId:student.id,guardianId:guardian.id,relationship:'Guardian',isPrimary:true}})
    await prisma.enrolment.upsert({where:{studentId_termId:{studentId:student.id,termId:term.id}},update:{classId:classRecords.get(learner.className)!},create:{studentId:student.id,termId:term.id,classId:classRecords.get(learner.className)!}})
    const invoiceNumber=`INV-2026-${learner.admission.slice(-3)}`
    const invoice=await prisma.invoice.upsert({where:{schoolId_invoiceNumber:{schoolId:school.id,invoiceNumber}},update:{},create:{schoolId:school.id,studentId:student.id,termId:term.id,invoiceNumber,status:'ACTIVE',dueAt:new Date('2026-08-30'),items:{create:{description:'Term 2 school fees',amount:learner.billed}}}})
    if(learner.paid>0){const reference=`SEED-${learner.admission}`;const payment=await prisma.payment.upsert({where:{schoolId_reference:{schoolId:school.id,reference}},update:{amount:learner.paid},create:{schoolId:school.id,receiptNumber:`RCT-${learner.admission.replace(/\D/g,'').slice(-5)}`,method:'MPESA',reference,amount:learner.paid,status:'COMPLETED'}});await prisma.paymentAllocation.upsert({where:{paymentId_invoiceId:{paymentId:payment.id,invoiceId:invoice.id}},update:{amount:learner.paid},create:{paymentId:payment.id,invoiceId:invoice.id,studentId:student.id,amount:learner.paid}})}
  }
  console.info(`Seeded ${school.name} (${school.id}) with Phase Three staff and academic records`)
}

main().catch(error => { console.error(error); process.exit(1) }).finally(() => prisma.$disconnect())
