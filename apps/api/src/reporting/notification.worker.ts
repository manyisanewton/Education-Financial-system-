import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { NotificationJobStatus, Prisma } from '@shulefinance/database'
import { DatabaseService } from '../database/database.service'
@Injectable()
export class NotificationWorker implements OnModuleInit,OnModuleDestroy{
 private readonly logger=new Logger(NotificationWorker.name);private timer?:NodeJS.Timeout;private running=false
 constructor(private readonly db:DatabaseService){}
 onModuleInit(){this.timer=setInterval(()=>void this.tick(),5000);this.timer.unref();void this.tick()}
 onModuleDestroy(){if(this.timer)clearInterval(this.timer)}
 private async tick(){if(this.running)return;this.running=true;try{for(let count=0;count<20;count++){const job=await this.claim();if(!job)break;await this.deliver(job)}}finally{this.running=false}}
 private async claim(){return this.db.$transaction(async tx=>{const rows=await tx.$queryRaw<Array<{id:string}>>(Prisma.sql`SELECT id FROM notification_jobs WHERE status = 'QUEUED' AND scheduled_at <= NOW() AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '10 minutes') ORDER BY scheduled_at ASC FOR UPDATE SKIP LOCKED LIMIT 1`);if(!rows[0])return null;return tx.notificationJob.update({where:{id:rows[0].id},data:{status:NotificationJobStatus.PROCESSING,lockedAt:new Date(),attempts:{increment:1}}})})}
 private async deliver(job:any){try{const payload=job.payload as{message?:string};if(!payload.message)throw new Error('Notification message is missing');this.logger.log(`${job.channel} notification accepted for ${this.mask(job.recipient)}`);await this.db.notificationJob.update({where:{id:job.id},data:{status:NotificationJobStatus.SENT,sentAt:new Date(),lockedAt:null,providerId:`development-${crypto.randomUUID()}`,lastError:null}})}catch(error){const failed=job.attempts>=job.maxAttempts;await this.db.notificationJob.update({where:{id:job.id},data:{status:failed?NotificationJobStatus.FAILED:NotificationJobStatus.QUEUED,lockedAt:null,lastError:error instanceof Error?error.message:'Delivery failed',scheduledAt:new Date(Date.now()+Math.min(3600000,30000*2**job.attempts))}})}}
 private mask(recipient:string){return recipient.length<5?'***':`${recipient.slice(0,2)}***${recipient.slice(-2)}`}
}
