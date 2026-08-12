import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request } from 'express'
import { map, type Observable } from 'rxjs'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T>{intercept(context:ExecutionContext,next:CallHandler<T>):Observable<unknown>{const request=context.switchToHttp().getRequest<Request>();return next.handle().pipe(map(data=>({success:true,data,meta:{timestamp:new Date().toISOString(),requestId:request.id}})))}}
