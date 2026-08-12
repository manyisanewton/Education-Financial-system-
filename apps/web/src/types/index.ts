export type Language = 'en' | 'sw'
export type Status = 'Paid' | 'Partial' | 'Overdue' | 'Pending' | 'Approved'

export interface Student {
  id: string
  name: string
  admission: string
  grade: string
  guardian: string
  phone: string
  billed: number
  paid: number
  status: Status
  initials: string
  color: string
}

export interface FeeItem { id: string; label: string; amount: number }
export interface StudentTransaction { id: string; studentId: string; type: 'Invoice' | 'Payment'; description: string; date: string; amount: number; method?: string; reference?: string; status: 'Completed' | 'Pending' | 'Voided' }
export interface FeeStructure { id:string; name:string; grade:string; term:string; year:number; items:FeeItem[]; status:'Draft'|'Active'|'Archived'; updatedAt:string }
export interface InvoiceBatch { id:string; structureId:string; structureName:string; grade:string; term:string; count:number; total:number; date:string; status:'Generated'|'Partially paid'|'Paid' }

export interface Payment {
  id: string
  student: string
  admission: string
  amount: number
  method: 'M-Pesa' | 'Bank' | 'Cash' | 'Cheque'
  reference: string
  date: string
  status: 'Completed' | 'Pending'
}

export interface Expense {
  id: string
  description: string
  category: string
  vendor: string
  amount: number
  date: string
  status: 'Approved' | 'Pending' | 'Rejected'
  requestedBy?: string
  approvedBy?: string
  paymentMethod?: 'M-Pesa' | 'Bank' | 'Cash' | 'Cheque'
  reference?: string
  document?: string
  notes?: string
  reviewNote?: string
}
export interface BudgetItem { id:string; category:string; allocated:number }
export interface Budget { id:string; name:string; term:string; year:number; items:BudgetItem[]; status:'Draft'|'Pending'|'Approved'|'Archived'; createdBy:string; approvedBy?:string; updatedAt:string; note?:string }
export interface AuditEvent { id:string; timestamp:string; user:string; role:string; action:string; module:'Students'|'Fees'|'Payments'|'Expenses'|'Budgets'|'Team'|'System'; recordId:string; description:string; severity:'Info'|'Success'|'Warning'|'Critical'; changes?:{field:string;before:string;after:string}[]; ipAddress?:string }
export type PermissionLevel='None'|'View'|'Manage'|'Approve'
export interface StaffRole { id:string; name:string; description:string; members:number; color:string; permissions:Record<string,PermissionLevel>; system?:boolean }
export interface StaffMember { id:string; name:string; email:string; phone:string; roleId:string; status:'Active'|'Invited'|'Suspended'; lastActive:string; initials:string; color:string }
export interface SchoolSettings { schoolName:string; registrationNumber:string; motto:string; email:string; phone:string; address:string; county:string; country:string; currency:string; timezone:string; academicYear:number; currentTerm:string; termStart:string; termEnd:string; invoicePrefix:string; receiptPrefix:string; paymentMethods:string[]; receiptFooter:string; requireExpenseApproval:boolean; expenseApprovalLimit:number; smsReminders:boolean; emailReceipts:boolean; overdueReminders:boolean; reminderDays:number; twoFactorAuth:boolean; sessionTimeout:number; passwordExpiry:number }
