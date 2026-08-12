import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { Public } from '../auth/auth.decorators'

@Public()
@Controller('health')
export class HealthController{
 constructor(private readonly database:DatabaseService){}
 @Get('live')live(){return{status:'ok',service:'shulefinance-api',uptimeSeconds:Math.floor(process.uptime())}}
 @Get('ready')async ready(){try{await this.database.$queryRaw`SELECT 1`;return{status:'ready',database:'connected'}}catch{throw new ServiceUnavailableException('Database is unavailable')}}
}
