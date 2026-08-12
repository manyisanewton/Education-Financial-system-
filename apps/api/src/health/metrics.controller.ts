import { Controller, Get, Res, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { Public } from '../auth/auth.decorators'
import { DatabaseService } from '../database/database.service'
import type { Environment } from '../config/environment'

@Public()
@Controller('metrics')
export class MetricsController{
 constructor(private readonly database:DatabaseService,private readonly config:ConfigService<Environment,true>){}
 @Get()async metrics(@Res() response:Response){const configured=this.config.get('METRICS_TOKEN',{infer:true});const supplied=response.req.headers.authorization?.replace(/^Bearer\s+/i,'');if(configured&&supplied!==configured)throw new UnauthorizedException('Metrics token is invalid');const [queued,failed]=await Promise.all([this.database.notificationJob.count({where:{status:{in:['QUEUED','PROCESSING']}}}),this.database.notificationJob.count({where:{status:'FAILED'}})]);const memory=process.memoryUsage();const lines=['# HELP shulefinance_up API availability','# TYPE shulefinance_up gauge','shulefinance_up 1','# HELP process_uptime_seconds Process uptime','# TYPE process_uptime_seconds gauge',`process_uptime_seconds ${process.uptime()}`,'# HELP process_resident_memory_bytes Resident memory','# TYPE process_resident_memory_bytes gauge',`process_resident_memory_bytes ${memory.rss}`,'# HELP shulefinance_notification_queue_jobs Pending notification jobs','# TYPE shulefinance_notification_queue_jobs gauge',`shulefinance_notification_queue_jobs ${queued}`,'# HELP shulefinance_notification_failed_jobs Failed notification jobs','# TYPE shulefinance_notification_failed_jobs gauge',`shulefinance_notification_failed_jobs ${failed}`];response.type('text/plain; version=0.0.4').send(`${lines.join('\n')}\n`)}
}
