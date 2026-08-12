import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import type { Request } from 'express'
import { CurrentUser, RequirePermissions } from '../auth/auth.decorators'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { CreateExpenseDto, ExpenseQueryDto, ReviewBudgetDto, ReviewExpenseDto, SaveBudgetDto, SaveCategoryDto, SaveVendorDto } from './dto/expenditure.dto'
import { ExpenditureService } from './expenditure.service'
@Controller()
export class ExpenditureController{
 constructor(private readonly service:ExpenditureService){}
 @Get('expense-categories') @RequirePermissions('expenses.view') categories(@CurrentUser() user:AuthenticatedUser){return this.service.categories(user)}
 @Post('expense-categories') @RequirePermissions('expenses.create') createCategory(@CurrentUser() user:AuthenticatedUser,@Body() dto:SaveCategoryDto){return this.service.createCategory(user,dto)}
 @Get('vendors') @RequirePermissions('expenses.view') vendors(@CurrentUser() user:AuthenticatedUser){return this.service.vendors(user)}
 @Post('vendors') @RequirePermissions('expenses.create') createVendor(@CurrentUser() user:AuthenticatedUser,@Body() dto:SaveVendorDto){return this.service.createVendor(user,dto)}
 @Get('expenses') @RequirePermissions('expenses.view') expenses(@CurrentUser() user:AuthenticatedUser,@Query() query:ExpenseQueryDto){return this.service.expenses(user,query)}
 @Post('expenses') @RequirePermissions('expenses.create') createExpense(@CurrentUser() user:AuthenticatedUser,@Body() dto:CreateExpenseDto,@Req() req:Request){return this.service.createExpense(user,dto,this.context(req))}
 @Post('expenses/:id/review') @RequirePermissions('expenses.approve') reviewExpense(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:ReviewExpenseDto,@Req() req:Request){return this.service.reviewExpense(user,id,dto,this.context(req))}
 @Get('budgets') @RequirePermissions('budgets.view') budgets(@CurrentUser() user:AuthenticatedUser){return this.service.budgets(user)}
 @Post('budgets') @RequirePermissions('budgets.manage') createBudget(@CurrentUser() user:AuthenticatedUser,@Body() dto:SaveBudgetDto,@Req() req:Request){return this.service.saveBudget(user,null,dto,this.context(req))}
 @Patch('budgets/:id') @RequirePermissions('budgets.manage') updateBudget(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:SaveBudgetDto,@Req() req:Request){return this.service.saveBudget(user,id,dto,this.context(req))}
 @Post('budgets/:id/review') @RequirePermissions('budgets.approve') reviewBudget(@CurrentUser() user:AuthenticatedUser,@Param('id') id:string,@Body() dto:ReviewBudgetDto,@Req() req:Request){return this.service.reviewBudget(user,id,dto,this.context(req))}
 private context(req:Request):RequestContext{return{ipAddress:req.ip,requestId:req.id?.toString(),userAgent:req.headers['user-agent']}}
}
