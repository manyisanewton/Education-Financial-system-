import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import cookieParser = require('cookie-parser')
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import type { Environment } from './config/environment'

async function bootstrap(){const app=await NestFactory.create(AppModule,{bufferLogs:true});const config=app.get(ConfigService<Environment,true>);app.useLogger(app.get(Logger));app.use(helmet());app.use(cookieParser());app.enableCors({origin:config.get('CORS_ORIGINS',{infer:true}).split(',').map(origin=>origin.trim()),credentials:true,methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS']});app.setGlobalPrefix(config.get('API_PREFIX',{infer:true}));app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));app.useGlobalFilters(new ApiExceptionFilter());app.useGlobalInterceptors(new ResponseInterceptor());app.enableShutdownHooks();await app.listen(config.get('PORT',{infer:true}),'0.0.0.0')}
void bootstrap()
