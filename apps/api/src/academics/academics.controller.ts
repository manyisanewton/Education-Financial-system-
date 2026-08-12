import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import type { Request } from 'express'
import { CurrentUser, RequirePermissions } from '../auth/auth.decorators'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { AcademicsService } from './academics.service'
import { CreateAcademicYearDto, CreateClassDto, CreateEnrolmentDto, CreateGuardianDto, CreateTermDto, PaginationQueryDto, SaveStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/academic.dto'

@Controller()
export class AcademicsController {
  constructor(private readonly academics: AcademicsService) {}

  @Get('students') @RequirePermissions('students.view') listStudents(@CurrentUser() user:AuthenticatedUser,@Query() query:StudentQueryDto){return this.academics.listStudents(user,query)}
  @Get('students/:studentId') @RequirePermissions('students.view') getStudent(@CurrentUser() user:AuthenticatedUser,@Param('studentId') id:string){return this.academics.getStudent(user,id)}
  @Post('students') @RequirePermissions('students.manage') createStudent(@CurrentUser() user:AuthenticatedUser,@Body() dto:SaveStudentDto,@Req() request:Request){return this.academics.createStudent(user,dto,this.context(request))}
  @Patch('students/:studentId') @RequirePermissions('students.manage') updateStudent(@CurrentUser() user:AuthenticatedUser,@Param('studentId') id:string,@Body() dto:UpdateStudentDto,@Req() request:Request){return this.academics.updateStudent(user,id,dto,this.context(request))}

  @Get('guardians') @RequirePermissions('students.view') listGuardians(@CurrentUser() user:AuthenticatedUser,@Query() query:PaginationQueryDto){return this.academics.listGuardians(user,query)}
  @Post('guardians') @RequirePermissions('students.manage') createGuardian(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateGuardianDto){return this.academics.createGuardian(user,dto)}
  @Get('classes') @RequirePermissions('students.view') listClasses(@CurrentUser() user:AuthenticatedUser){return this.academics.listClasses(user)}
  @Post('classes') @RequirePermissions('students.manage') createClass(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateClassDto){return this.academics.createClass(user,dto)}
  @Get('academic-years') @RequirePermissions('students.view') listAcademicYears(@CurrentUser() user:AuthenticatedUser){return this.academics.listAcademicYears(user)}
  @Post('academic-years') @RequirePermissions('students.manage') createAcademicYear(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateAcademicYearDto){return this.academics.createAcademicYear(user,dto)}
  @Post('terms') @RequirePermissions('students.manage') createTerm(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateTermDto){return this.academics.createTerm(user,dto)}
  @Post('enrolments') @RequirePermissions('students.manage') createEnrolment(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateEnrolmentDto){return this.academics.createEnrolment(user,dto)}

  private context(request:Request):RequestContext{return{ipAddress:request.ip,requestId:request.id?.toString(),userAgent:request.headers['user-agent']}}
}
