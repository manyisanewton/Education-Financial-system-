import { PERMISSIONS_KEY } from './auth.constants'
import { PaymentsController } from '../payments/payments.controller'
import { ExpenditureController } from '../expenditure/expenditure.controller'
import { ReportingController } from '../reporting/reporting.controller'

const permissions=(controller:object,method:string)=>Reflect.getMetadata(PERMISSIONS_KEY,(controller as any)[method])

describe('sensitive controller permission metadata',()=>{
 it.each([
  [PaymentsController.prototype,'capture','payments.record'],
  [PaymentsController.prototype,'reverse','payments.reverse'],
  [ExpenditureController.prototype,'reviewExpense','expenses.approve'],
  [ExpenditureController.prototype,'reviewBudget','budgets.approve'],
  [ReportingController.prototype,'export','reports.export'],
  [ReportingController.prototype,'reminders','reports.export'],
 ])('%s.%s requires %s',(controller,method,permission)=>{
  expect(permissions(controller,method)).toContain(permission)
 })
})
