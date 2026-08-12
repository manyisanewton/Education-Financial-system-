import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common'
import type { Request } from 'express'
import { CurrentUser, RequirePermissions } from '../auth/auth.decorators'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { CapturePaymentDto, CreateReconciliationDto, PaymentListQueryDto, ReversePaymentDto } from './dto/payments.dto'
import { PaymentsService } from './payments.service'

@Controller()
export class PaymentsController{
 constructor(private readonly payments:PaymentsService){}
 @Get('payments') @RequirePermissions('payments.view') list(@CurrentUser() user:AuthenticatedUser,@Query() query:PaymentListQueryDto){return this.payments.list(user,query)}
 @Post('payments') @RequirePermissions('payments.manage') capture(@CurrentUser() user:AuthenticatedUser,@Body() dto:CapturePaymentDto,@Req() req:Request){return this.payments.capture(user,dto,this.context(req))}
 @Get('payments/:id/receipt') @RequirePermissions('payments.view') receipt(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string){return this.payments.receipt(user,id)}
 @Post('payments/:id/reverse') @RequirePermissions('payments.manage') reverse(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:ReversePaymentDto,@Req() req:Request){return this.payments.reverse(user,id,dto,this.context(req))}
 @Get('reconciliations') @RequirePermissions('payments.view') reconciliations(@CurrentUser() user:AuthenticatedUser){return this.payments.listReconciliations(user)}
 @Post('reconciliations') @RequirePermissions('payments.manage') reconcile(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateReconciliationDto,@Req() req:Request){return this.payments.reconcile(user,dto,this.context(req))}
 private context(req:Request):RequestContext{return{ipAddress:req.ip,requestId:req.id?.toString(),userAgent:req.headers['user-agent']}}
}
