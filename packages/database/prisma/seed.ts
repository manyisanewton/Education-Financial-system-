import { PrismaClient, RoleLevel, TermStatus, UserStatus } from '@prisma/client'
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
  await prisma.term.upsert({ where: { academicYearId_name: { academicYearId: year.id, name: 'Term 2' } }, update: { status: TermStatus.ACTIVE }, create: { academicYearId: year.id, name: 'Term 2', startsOn: new Date('2026-05-06'), endsOn: new Date('2026-08-30'), status: TermStatus.ACTIVE } })
  for (const [name, grade] of [['Grade 6 A','Grade 6'],['Grade 6 B','Grade 6'],['Grade 7 B','Grade 7'],['Grade 8 A','Grade 8']]) await prisma.class.upsert({ where: { schoolId_name: { schoolId: school.id, name } }, update: {}, create: { schoolId: school.id, name, grade } })
  console.info(`Seeded ${school.name} (${school.id}) with Phase Two development staff accounts`)
}

main().catch(error => { console.error(error); process.exit(1) }).finally(() => prisma.$disconnect())
