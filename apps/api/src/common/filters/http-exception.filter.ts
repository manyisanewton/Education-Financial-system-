import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter{
 catch(exception:unknown,host:ArgumentsHost){const response=host.switchToHttp().getResponse<Response>();const request=host.switchToHttp().getRequest<Request>();const status=exception instanceof HttpException?exception.getStatus():HttpStatus.INTERNAL_SERVER_ERROR;const payload=exception instanceof HttpException?exception.getResponse():null;const message=typeof payload==='object'&&payload&&'message'in payload?(payload as {message:unknown}).message:exception instanceof Error&&status<500?exception.message:status===500?'Internal server error':'Request failed';response.status(status).json({success:false,error:{statusCode:status,message,code:status===500?'INTERNAL_ERROR':'REQUEST_ERROR'},meta:{timestamp:new Date().toISOString(),path:request.originalUrl,requestId:request.id}})}
}
