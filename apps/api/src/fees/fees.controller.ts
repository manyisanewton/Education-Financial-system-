import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import type { Request } from 'express'
import { CurrentUser, RequirePermissions } from '../auth/auth.decorators'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { ChangeInvoiceStateDto, CreateAdjustmentDto, CreateCreditNoteDto, FeeListQueryDto, GenerateInvoicesDto, InvoiceListQueryDto, SaveFeeStructureDto } from './dto/fees.dto'
import { FeesService } from './fees.service'

@Controller()
export class FeesController{
 constructor(private readonly fees:FeesService){}
 @Get('fee-structures') @RequirePermissions('fees.view') structures(@CurrentUser() user:AuthenticatedUser,@Query() query:FeeListQueryDto){return this.fees.listStructures(user,query)}
 @Post('fee-structures') @RequirePermissions('fees.manage') createStructure(@CurrentUser() user:AuthenticatedUser,@Body() dto:SaveFeeStructureDto,@Req() req:Request){return this.fees.createStructure(user,dto,this.context(req))}
 @Patch('fee-structures/:id') @RequirePermissions('fees.manage') updateStructure(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:SaveFeeStructureDto,@Req() req:Request){return this.fees.updateStructure(user,id,dto,this.context(req))}
 @Post('fee-structures/:id/generate-invoices') @RequirePermissions('invoices.generate') generate(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:GenerateInvoicesDto,@Req() req:Request){return this.fees.generateBatch(user,id,dto,this.context(req))}
 @Get('invoice-batches') @RequirePermissions('fees.view') batches(@CurrentUser() user:AuthenticatedUser){return this.fees.listBatches(user)}
 @Get('invoices') @RequirePermissions('fees.view') invoices(@CurrentUser() user:AuthenticatedUser,@Query() query:InvoiceListQueryDto){return this.fees.listInvoices(user,query)}
 @Patch('invoices/:id/state') @RequirePermissions('fees.manage') state(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:ChangeInvoiceStateDto,@Req() req:Request){return this.fees.changeInvoiceState(user,id,dto,this.context(req))}
 @Post('invoices/:id/credit-notes') @RequirePermissions('fees.manage') credit(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:CreateCreditNoteDto,@Req() req:Request){return this.fees.createCreditNote(user,id,dto,this.context(req))}
 @Post('invoices/:id/adjustments') @RequirePermissions('fees.manage') adjustment(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:CreateAdjustmentDto,@Req() req:Request){return this.fees.createAdjustment(user,id,dto,this.context(req))}
 @Get('students/:id/statement') @RequirePermissions('fees.view') statement(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string){return this.fees.statement(user,id)}
 private context(req:Request):RequestContext{return{ipAddress:req.ip,requestId:req.id?.toString(),userAgent:req.headers['user-agent']}}
}
