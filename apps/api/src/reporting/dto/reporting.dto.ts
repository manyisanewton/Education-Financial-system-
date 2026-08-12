import { IsArray, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { NotificationChannel } from '@shulefinance/database'
export class ReportQueryDto { @IsOptional() @IsUUID() termId?:string }
export class ExportReportDto extends ReportQueryDto { @IsOptional() @IsString() type='financial'; @IsEnum(['csv','pdf']) format!:'csv'|'pdf' }
export class QueueRemindersDto { @IsOptional() @IsUUID() termId?:string; @IsOptional() @IsArray() @IsEnum(NotificationChannel,{each:true}) channels?:NotificationChannel[] }
export class QueueStudentReminderDto { @IsOptional() @IsArray() @IsEnum(NotificationChannel,{each:true}) channels?:NotificationChannel[]; @IsOptional() @IsString() @Length(2,500) message?:string }
