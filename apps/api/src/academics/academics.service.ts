import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, StudentStatus } from '@shulefinance/database'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { DatabaseService } from '../database/database.service'
import type { CreateAcademicYearDto, CreateClassDto, CreateEnrolmentDto, CreateGuardianDto, CreateTermDto, PaginationQueryDto, SaveStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/academic.dto'

const studentInclude = Prisma.validator<Prisma.StudentInclude>()({
  guardians: { include: { guardian: true }, orderBy: { isPrimary: 'desc' } },
  enrolments: { include: { class: true, term: { include: { academicYear: true } } }, orderBy: { term: { startsOn: 'desc' } } },
  invoices: { where: { status: { not: 'VOIDED' } }, include: { items: true, allocations: { include: { payment: true } }, creditNotes: { where: { status: 'ACTIVE' }, include: { items: true } }, adjustments: true } },
})
type StudentRecord = Prisma.StudentGetPayload<{ include: typeof studentInclude }>

@Injectable()
export class AcademicsService {
  constructor(private readonly database: DatabaseService) {}

  async listStudents(user: AuthenticatedUser, query: StudentQueryDto) {
    const where: Prisma.StudentWhereInput = { schoolId: user.schoolId, ...(query.status ? { status: query.status } : {}), ...(query.classId || query.termId ? { enrolments: { some: { ...(query.classId ? { classId: query.classId } : {}), ...(query.termId ? { termId: query.termId } : {}) } } } : {}) }
    if (query.search) where.OR = [{ firstName: { contains: query.search, mode: 'insensitive' } }, { lastName: { contains: query.search, mode: 'insensitive' } }, { admissionNumber: { contains: query.search, mode: 'insensitive' } }, { guardians: { some: { guardian: { OR: [{ firstName: { contains: query.search, mode: 'insensitive' } }, { lastName: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search } }] } } } }]
    const skip = (query.page - 1) * query.pageSize
    const [records, total] = await this.database.$transaction([this.database.student.findMany({ where, include: studentInclude, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], skip, take: query.pageSize }), this.database.student.count({ where })])
    return { students: records.map(record => this.presentStudent(record)), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } }
  }

  async getStudent(user: AuthenticatedUser, studentId: string) {
    const student = await this.database.student.findFirst({ where: { id: studentId, schoolId: user.schoolId }, include: studentInclude })
    if (!student) throw new NotFoundException('Student not found')
    return { student: this.presentStudent(student) }
  }

  async createStudent(user: AuthenticatedUser, dto: SaveStudentDto, context: RequestContext) {
    const [studentName, guardianName] = [this.splitName(dto.fullName), this.splitName(dto.guardianName)]
    await this.assertClassAndTerm(user.schoolId, dto.classId, dto.termId)
    try {
      const student = await this.database.$transaction(async transaction => {
        const guardian = await transaction.guardian.upsert({ where: { schoolId_phone: { schoolId: user.schoolId, phone: dto.guardianPhone.trim() } }, update: { firstName: guardianName.firstName, lastName: guardianName.lastName, email: dto.guardianEmail?.toLowerCase() }, create: { schoolId: user.schoolId, firstName: guardianName.firstName, lastName: guardianName.lastName, phone: dto.guardianPhone.trim(), email: dto.guardianEmail?.toLowerCase() } })
        const created = await transaction.student.create({ data: { schoolId: user.schoolId, admissionNumber: dto.admissionNumber.trim().toUpperCase(), firstName: studentName.firstName, lastName: studentName.lastName, status: dto.status, guardians: { create: { guardianId: guardian.id, relationship: dto.relationship, isPrimary: true } }, enrolments: { create: { classId: dto.classId, termId: dto.termId } } } })
        await transaction.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'STUDENT_CREATED', module: 'Students', recordType: 'Student', recordId: created.id, after: { admissionNumber: created.admissionNumber, name: dto.fullName, classId: dto.classId, termId: dto.termId, guardianId: guardian.id }, ipAddress: context.ipAddress, requestId: context.requestId } })
        return transaction.student.findUniqueOrThrow({ where: { id: created.id }, include: studentInclude })
      })
      return { student: this.presentStudent(student) }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Admission number already exists for this school')
      throw error
    }
  }

  async updateStudent(user: AuthenticatedUser, studentId: string, dto: UpdateStudentDto, context: RequestContext) {
    const existing = await this.database.student.findFirst({ where: { id: studentId, schoolId: user.schoolId }, include: studentInclude })
    if (!existing) throw new NotFoundException('Student not found')
    if ((dto.classId && !dto.termId) || (!dto.classId && dto.termId)) throw new BadRequestException('classId and termId must be supplied together')
    if (dto.classId && dto.termId) await this.assertClassAndTerm(user.schoolId, dto.classId, dto.termId)
    const studentName = dto.fullName ? this.splitName(dto.fullName) : undefined
    const guardianName = dto.guardianName ? this.splitName(dto.guardianName) : undefined
    const primary = existing.guardians.find(item => item.isPrimary) ?? existing.guardians[0]
    const updated = await this.database.$transaction(async transaction => {
      await transaction.student.update({ where: { id: studentId }, data: { ...(studentName ? studentName : {}), ...(dto.status ? { status: dto.status } : {}) } })
      if (primary && (guardianName || dto.guardianPhone || dto.guardianEmail !== undefined)) await transaction.guardian.update({ where: { id: primary.guardianId }, data: { ...(guardianName ? guardianName : {}), ...(dto.guardianPhone ? { phone: dto.guardianPhone.trim() } : {}), ...(dto.guardianEmail !== undefined ? { email: dto.guardianEmail?.toLowerCase() } : {}) } })
      if (dto.classId && dto.termId) await transaction.enrolment.upsert({ where: { studentId_termId: { studentId, termId: dto.termId } }, update: { classId: dto.classId }, create: { studentId, termId: dto.termId, classId: dto.classId } })
      await transaction.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'STUDENT_UPDATED', module: 'Students', recordType: 'Student', recordId: studentId, before: { name: `${existing.firstName} ${existing.lastName}`, status: existing.status, guardian: primary ? `${primary.guardian.firstName} ${primary.guardian.lastName}` : null }, after: { ...dto }, ipAddress: context.ipAddress, requestId: context.requestId } })
      return transaction.student.findUniqueOrThrow({ where: { id: studentId }, include: studentInclude })
    })
    return { student: this.presentStudent(updated) }
  }

  async listGuardians(user: AuthenticatedUser, query: PaginationQueryDto) {
    const where: Prisma.GuardianWhereInput = { schoolId: user.schoolId, ...(query.search ? { OR: [{ firstName: { contains: query.search, mode: 'insensitive' } }, { lastName: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {}) }
    const [guardians, total] = await this.database.$transaction([this.database.guardian.findMany({ where, include: { _count: { select: { students: true } } }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.guardian.count({ where })])
    return { guardians: guardians.map(item => ({ id: item.id, name: `${item.firstName} ${item.lastName}`, phone: item.phone, email: item.email, students: item._count.students })), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } }
  }

  async createGuardian(user: AuthenticatedUser, dto: CreateGuardianDto) { const name = this.splitName(dto.fullName);try{return { guardian: await this.database.guardian.create({ data: { schoolId: user.schoolId, ...name, phone: dto.phone.trim(), email: dto.email?.toLowerCase() } }) }}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('A guardian with this phone already exists');throw error} }
  async listClasses(user: AuthenticatedUser) { const classes=await this.database.class.findMany({where:{schoolId:user.schoolId},include:{_count:{select:{enrolments:true}}},orderBy:[{grade:'asc'},{name:'asc'}]});return{classes:classes.map(item=>({id:item.id,name:item.name,grade:item.grade,enrolments:item._count.enrolments}))} }
  async createClass(user: AuthenticatedUser,dto:CreateClassDto){try{return{class:await this.database.class.create({data:{schoolId:user.schoolId,name:dto.name.trim(),grade:dto.grade.trim()}})}}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Class name already exists');throw error}}
  async listAcademicYears(user:AuthenticatedUser){return{academicYears:await this.database.academicYear.findMany({where:{schoolId:user.schoolId},include:{terms:{orderBy:{startsOn:'asc'}}},orderBy:{startsOn:'desc'}})}}
  async createAcademicYear(user:AuthenticatedUser,dto:CreateAcademicYearDto){this.assertDates(dto.startsOn,dto.endsOn);try{return{academicYear:await this.database.academicYear.create({data:{schoolId:user.schoolId,name:dto.name.trim(),startsOn:new Date(dto.startsOn),endsOn:new Date(dto.endsOn)}})}}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('Academic year already exists');throw error}}
  async createTerm(user:AuthenticatedUser,dto:CreateTermDto){this.assertDates(dto.startsOn,dto.endsOn);const year=await this.database.academicYear.findFirst({where:{id:dto.academicYearId,schoolId:user.schoolId}});if(!year)throw new NotFoundException('Academic year not found');return{term:await this.database.term.create({data:{academicYearId:year.id,name:dto.name.trim(),startsOn:new Date(dto.startsOn),endsOn:new Date(dto.endsOn),status:dto.status}})}}
  async createEnrolment(user:AuthenticatedUser,dto:CreateEnrolmentDto){await this.assertClassAndTerm(user.schoolId,dto.classId,dto.termId);const student=await this.database.student.findFirst({where:{id:dto.studentId,schoolId:user.schoolId}});if(!student)throw new NotFoundException('Student not found');return{enrolment:await this.database.enrolment.upsert({where:{studentId_termId:{studentId:dto.studentId,termId:dto.termId}},update:{classId:dto.classId},create:dto})}}

  private async assertClassAndTerm(schoolId:string,classId:string,termId:string){const [schoolClass,term]=await Promise.all([this.database.class.findFirst({where:{id:classId,schoolId}}),this.database.term.findFirst({where:{id:termId,academicYear:{schoolId}}})]);if(!schoolClass)throw new NotFoundException('Class not found');if(!term)throw new NotFoundException('Term not found')}
  private assertDates(startsOn:string,endsOn:string){if(new Date(startsOn)>=new Date(endsOn))throw new BadRequestException('End date must be after start date')}
  private splitName(fullName:string){const parts=fullName.trim().split(/\s+/);if(parts.length<2)throw new BadRequestException('Enter both first and last name');return{firstName:parts.shift()!,lastName:parts.join(' ')}}
  private presentStudent(student:StudentRecord){const guardian=student.guardians.find(item=>item.isPrimary)?.guardian??student.guardians[0]?.guardian;const enrolment=student.enrolments[0];const invoiceItems=student.invoices.flatMap(invoice=>invoice.items).reduce((sum,item)=>sum+Number(item.amount),0);const debits=student.invoices.flatMap(invoice=>invoice.adjustments).filter(item=>item.type==='DEBIT').reduce((sum,item)=>sum+Number(item.amount),0);const credits=student.invoices.flatMap(invoice=>invoice.creditNotes).flatMap(note=>note.items).reduce((sum,item)=>sum+Number(item.amount),0)+student.invoices.flatMap(invoice=>invoice.adjustments).filter(item=>item.type==='CREDIT').reduce((sum,item)=>sum+Number(item.amount),0);const payments=student.invoices.flatMap(invoice=>invoice.allocations).filter(allocation=>allocation.payment.status==='COMPLETED').reduce((sum,item)=>sum+Number(item.amount),0);const billed=invoiceItems+debits-credits,paid=payments,balance=billed-paid;return{id:student.id,name:`${student.firstName} ${student.lastName}`,admission:student.admissionNumber,grade:enrolment?.class.name??'Not enrolled',classId:enrolment?.classId??null,termId:enrolment?.termId??null,term:enrolment?`${enrolment.term.name}, ${enrolment.term.academicYear.name}`:null,guardian:guardian?`${guardian.firstName} ${guardian.lastName}`:'Not provided',guardianId:guardian?.id??null,phone:guardian?.phone??'Not provided',guardianEmail:guardian?.email??null,billed,paid,status:billed===0?'Overdue':balance<=0?'Paid':paid>0?'Partial':'Overdue',academicStatus:student.status,initials:`${student.firstName[0]}${student.lastName[0]}`.toUpperCase(),color:'#d6eee3'} }
}
