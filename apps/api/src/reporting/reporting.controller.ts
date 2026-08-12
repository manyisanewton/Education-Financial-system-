import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'
import { CurrentUser, RequirePermissions } from '../auth/auth.decorators'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { ExportReportDto, QueueRemindersDto, QueueStudentReminderDto, ReportQueryDto } from './dto/reporting.dto'
import { ReportingService } from './reporting.service'
@Controller()
export class ReportingController{
 constructor(private readonly service:ReportingService){}
 @Get('dashboard/summary') @RequirePermissions('dashboard.view') dashboard(@CurrentUser() user:AuthenticatedUser,@Query() query:ReportQueryDto){return this.service.dashboard(user,query)}
 @Get('reports/financial') @RequirePermissions('reports.view') financial(@CurrentUser() user:AuthenticatedUser,@Query() query:ReportQueryDto){return this.service.financial(user,query)}
 @Get('reports/export') @RequirePermissions('reports.export') async export(@CurrentUser() user:AuthenticatedUser,@Query() query:ExportReportDto,@Res() response:Response){const file=await this.service.export(user,query);response.setHeader('Content-Type',file.contentType);response.setHeader('Content-Disposition',`attachment; filename="${file.fileName}"`);response.send(file.body)}
 @Get('notifications/jobs') @RequirePermissions('reports.view') jobs(@CurrentUser() user:AuthenticatedUser){return this.service.jobs(user)}
 @Post('notifications/overdue-reminders') @RequirePermissions('reports.export') reminders(@CurrentUser() user:AuthenticatedUser,@Body() dto:QueueRemindersDto,@Req() req:Request){return this.service.queueOverdue(user,dto,this.context(req))}
 @Post('students/:id/reminders') @RequirePermissions('students.manage') studentReminder(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:QueueStudentReminderDto,@Req() req:Request){return this.service.queueStudent(user,id,dto,this.context(req))}
 private context(req:Request):RequestContext{return{ipAddress:req.ip,requestId:req.id?.toString(),userAgent:req.headers['user-agent']}}
}
