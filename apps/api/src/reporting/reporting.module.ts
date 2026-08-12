import { Module } from '@nestjs/common'
import { ReportingController } from './reporting.controller'
import { ReportingService } from './reporting.service'
import { NotificationWorker } from './notification.worker'
@Module({controllers:[ReportingController],providers:[ReportingService,NotificationWorker]})
export class ReportingModule{}
