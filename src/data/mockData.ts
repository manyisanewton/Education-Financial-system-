import type { AuditEvent, Budget, Expense, FeeItem, FeeStructure, InvoiceBatch, Payment, SchoolSettings, StaffMember, StaffRole, Student, StudentTransaction } from '../types'

export const students: Student[] = [
  { id:'ST-001', name:'John Kamau', admission:'GFA-2024-041', grade:'Grade 6 A', guardian:'Mary Wanjiku', phone:'+254 712 345 678', billed:35000, paid:25000, status:'Partial', initials:'JK', color:'#d6eee3' },
  { id:'ST-002', name:'Amina Hassan', admission:'GFA-2023-018', grade:'Grade 7 B', guardian:'Hassan Ali', phone:'+254 722 103 445', billed:38500, paid:38500, status:'Paid', initials:'AH', color:'#e9e1ff' },
  { id:'ST-003', name:'Brian Otieno', admission:'GFA-2025-112', grade:'Grade 4 A', guardian:'Grace Achieng', phone:'+254 733 882 109', billed:32000, paid:12000, status:'Overdue', initials:'BO', color:'#ffe6d6' },
  { id:'ST-004', name:'Faith Njeri', admission:'GFA-2022-007', grade:'Grade 8 A', guardian:'Peter Mwangi', phone:'+254 701 992 230', billed:41000, paid:41000, status:'Paid', initials:'FN', color:'#dceaff' },
  { id:'ST-005', name:'Kevin Kiptoo', admission:'GFA-2024-069', grade:'Grade 6 B', guardian:'Jane Chebet', phone:'+254 711 651 882', billed:35000, paid:28000, status:'Partial', initials:'KK', color:'#ffecd0' },
  { id:'ST-006', name:'Zawadi Mumo', admission:'GFA-2025-121', grade:'Grade 3 A', guardian:'Esther Mumo', phone:'+254 724 552 091', billed:29500, paid:29500, status:'Paid', initials:'ZM', color:'#f5dff0' },
]

export const payments: Payment[] = [
  { id:'RCT-08421', student:'John Kamau', admission:'GFA-2024-041', amount:10000, method:'M-Pesa', reference:'QWE123XYZ', date:'08 Aug 2026', status:'Completed' },
  { id:'RCT-08420', student:'Amina Hassan', admission:'GFA-2023-018', amount:18500, method:'Bank', reference:'EQUITY-90214', date:'08 Aug 2026', status:'Completed' },
  { id:'RCT-08419', student:'Faith Njeri', admission:'GFA-2022-007', amount:21000, method:'M-Pesa', reference:'SJK872PLM', date:'07 Aug 2026', status:'Completed' },
  { id:'RCT-08418', student:'Kevin Kiptoo', admission:'GFA-2024-069', amount:8000, method:'Cash', reference:'CASH-0281', date:'07 Aug 2026', status:'Completed' },
  { id:'RCT-08417', student:'Brian Otieno', admission:'GFA-2025-112', amount:5000, method:'Cheque', reference:'CHQ-554201', date:'06 Aug 2026', status:'Pending' },
]

export const expenses: Expense[] = [
  { id:'EXP-201', description:'Staff salaries — July', category:'Salaries', vendor:'Greenfield Payroll', amount:1200000, date:'01 Aug 2026', status:'Approved',requestedBy:'Catherine Njeri',approvedBy:'Dr. James Mwangi',paymentMethod:'Bank',reference:'EFT-208821',document:'july-payroll.pdf' },
  { id:'EXP-202', description:'Classroom window repairs', category:'Maintenance', vendor:'ABC Contractors', amount:45000, date:'08 Aug 2026', status:'Pending',requestedBy:'David Karanja',paymentMethod:'M-Pesa',reference:'PENDING',document:'abc-quotation.pdf',notes:'Repairs required before the next school inspection.' },
  { id:'EXP-203', description:'Term 2 food supplies', category:'Food', vendor:'Fresh Harvest Ltd', amount:250000, date:'05 Aug 2026', status:'Approved',requestedBy:'Sarah Muthoni',approvedBy:'Dr. James Mwangi',paymentMethod:'Bank',reference:'EFT-208104',document:'fresh-harvest-invoice.pdf' },
  { id:'EXP-204', description:'Electricity and water', category:'Utilities', vendor:'Utility Providers', amount:150000, date:'03 Aug 2026', status:'Approved',requestedBy:'Catherine Njeri',approvedBy:'Dr. James Mwangi',paymentMethod:'M-Pesa',reference:'TGH82KLM2',document:'utilities-august.pdf' },
  { id:'EXP-205', description:'New sports equipment', category:'Equipment', vendor:'Pro Sports Kenya', amount:84000, date:'07 Aug 2026', status:'Rejected',requestedBy:'Coach Samuel',reviewNote:'Obtain two additional supplier quotations before approval.',document:'pro-sports-quote.pdf' },
]

export const collectionTrend = [
  { month:'Mar', collected:420, expenses:240 }, { month:'Apr', collected:610, expenses:290 },
  { month:'May', collected:540, expenses:310 }, { month:'Jun', collected:880, expenses:360 },
  { month:'Jul', collected:720, expenses:410 }, { month:'Aug', collected:750, expenses:240 },
]

export const classPerformance = [
  { grade:'Grade 8', rate:91, amount:'KSh 684K' }, { grade:'Grade 7', rate:87, amount:'KSh 721K' },
  { grade:'Grade 6', rate:82, amount:'KSh 656K' }, { grade:'Grade 5', rate:78, amount:'KSh 598K' },
  { grade:'Grade 4', rate:74, amount:'KSh 512K' },
]

export const paymentMethods = [
  { name:'M-Pesa', method:'M-Pesa', value:64, color:'#1f8061' }, { name:'Bank', method:'Bank', value:22, color:'#d9a62e' },
  { name:'Cash', method:'Cash', value:10, color:'#6b86a3' }, { name:'Cheque', method:'Cheque', value:4, color:'#d9dfdc' },
]

export const feeItemsByGrade: Record<string, FeeItem[]> = {
  'Grade 6 A': [{id:'F-01',label:'Tuition',amount:25000},{id:'F-02',label:'Transport',amount:5000},{id:'F-03',label:'Lunch programme',amount:3000},{id:'F-04',label:'Activities',amount:2000}],
  'Grade 6 B': [{id:'F-01',label:'Tuition',amount:25000},{id:'F-02',label:'Transport',amount:5000},{id:'F-03',label:'Lunch programme',amount:3000},{id:'F-04',label:'Activities',amount:2000}],
}

export const initialTransactions: StudentTransaction[] = [
  {id:'INV-2026-1041',studentId:'ST-001',type:'Invoice',description:'Term 2 fee invoice',date:'06 May 2026',amount:35000,status:'Completed'},
  {id:'RCT-07932',studentId:'ST-001',type:'Payment',description:'Fee payment',date:'15 Jul 2026',amount:15000,method:'M-Pesa',reference:'RJK72PLQ1',status:'Completed'},
  {id:'RCT-08421',studentId:'ST-001',type:'Payment',description:'Fee payment',date:'08 Aug 2026',amount:10000,method:'M-Pesa',reference:'QWE123XYZ',status:'Completed'},
  {id:'INV-2026-1018',studentId:'ST-002',type:'Invoice',description:'Term 2 fee invoice',date:'06 May 2026',amount:38500,status:'Completed'},
  {id:'RCT-08420',studentId:'ST-002',type:'Payment',description:'Fee payment',date:'08 Aug 2026',amount:18500,method:'Bank',reference:'EQUITY-90214',status:'Completed'},
]

export const initialFeeStructures:FeeStructure[]=[
 {id:'FS-2606A',name:'Grade 6 Standard',grade:'Grade 6',term:'Term 2',year:2026,status:'Active',updatedAt:'02 May 2026',items:[{id:'FI-1',label:'Tuition',amount:25000},{id:'FI-2',label:'Transport',amount:5000},{id:'FI-3',label:'Lunch programme',amount:3000},{id:'FI-4',label:'Activities',amount:2000}]},
 {id:'FS-2607',name:'Grade 7 Standard',grade:'Grade 7',term:'Term 2',year:2026,status:'Active',updatedAt:'02 May 2026',items:[{id:'FI-1',label:'Tuition',amount:28000},{id:'FI-2',label:'Transport',amount:5000},{id:'FI-3',label:'Lunch programme',amount:3500},{id:'FI-4',label:'Activities',amount:2000}]},
 {id:'FS-2608',name:'Grade 8 Standard',grade:'Grade 8',term:'Term 2',year:2026,status:'Active',updatedAt:'01 May 2026',items:[{id:'FI-1',label:'Tuition',amount:30000},{id:'FI-2',label:'Transport',amount:5500},{id:'FI-3',label:'Lunch programme',amount:3500},{id:'FI-4',label:'Exam fee',amount:2000}]},
 {id:'FS-2604',name:'Grade 4 Standard',grade:'Grade 4',term:'Term 2',year:2026,status:'Active',updatedAt:'01 May 2026',items:[{id:'FI-1',label:'Tuition',amount:23000},{id:'FI-2',label:'Transport',amount:4500},{id:'FI-3',label:'Lunch programme',amount:3000},{id:'FI-4',label:'Activities',amount:1500}]},
 {id:'FS-2706',name:'Grade 6 Standard',grade:'Grade 6',term:'Term 3',year:2026,status:'Draft',updatedAt:'08 Aug 2026',items:[{id:'FI-1',label:'Tuition',amount:25000},{id:'FI-2',label:'Transport',amount:5000},{id:'FI-3',label:'Lunch programme',amount:3000}]}
]
export const initialInvoiceBatches:InvoiceBatch[]=[
 {id:'BAT-260501',structureId:'FS-2606A',structureName:'Grade 6 Standard',grade:'Grade 6',term:'Term 2, 2026',count:146,total:5110000,date:'06 May 2026',status:'Partially paid'},
 {id:'BAT-260502',structureId:'FS-2607',structureName:'Grade 7 Standard',grade:'Grade 7',term:'Term 2, 2026',count:118,total:4543000,date:'06 May 2026',status:'Partially paid'},
 {id:'BAT-260503',structureId:'FS-2608',structureName:'Grade 8 Standard',grade:'Grade 8',term:'Term 2, 2026',count:104,total:4264000,date:'06 May 2026',status:'Partially paid'}
]
export const initialBudgets:Budget[]=[
 {id:'BDG-T2-2026',name:'Term 2 Operating Budget',term:'Term 2',year:2026,status:'Approved',createdBy:'Catherine Njeri',approvedBy:'Dr. James Mwangi',updatedAt:'28 Apr 2026',note:'Approved operating allocation for Term 2.',items:[{id:'BI-1',category:'Salaries',allocated:1500000},{id:'BI-2',category:'Food',allocated:500000},{id:'BI-3',category:'Utilities',allocated:200000},{id:'BI-4',category:'Maintenance',allocated:300000},{id:'BI-5',category:'Transport',allocated:250000},{id:'BI-6',category:'Learning materials',allocated:350000},{id:'BI-7',category:'Equipment',allocated:180000},{id:'BI-8',category:'Security',allocated:120000},{id:'BI-9',category:'Stationery',allocated:100000}]},
 {id:'BDG-T3-2026',name:'Term 3 Operating Budget',term:'Term 3',year:2026,status:'Draft',createdBy:'Catherine Njeri',updatedAt:'08 Aug 2026',items:[{id:'BI-1',category:'Salaries',allocated:1550000},{id:'BI-2',category:'Food',allocated:520000},{id:'BI-3',category:'Utilities',allocated:220000},{id:'BI-4',category:'Maintenance',allocated:280000},{id:'BI-5',category:'Learning materials',allocated:400000}]}
]
export const initialAuditEvents:AuditEvent[]=[
 {id:'AUD-260808-001',timestamp:'08 Aug 2026 · 10:21 AM',user:'Catherine Njeri',role:'School Accountant',action:'Payment recorded',module:'Payments',recordId:'RCT-08421',description:'Recorded an M-Pesa fee payment of KSh 10,000 for John Kamau.',severity:'Success',changes:[{field:'Student balance',before:'KSh 20,000',after:'KSh 10,000'},{field:'Amount paid',before:'KSh 15,000',after:'KSh 25,000'}],ipAddress:'192.168.1.24'},
 {id:'AUD-260808-002',timestamp:'08 Aug 2026 · 09:48 AM',user:'Dr. James Mwangi',role:'Principal',action:'Expense awaiting review',module:'Expenses',recordId:'EXP-202',description:'Opened the classroom window repair request submitted by David Karanja.',severity:'Info',ipAddress:'192.168.1.11'},
 {id:'AUD-260807-003',timestamp:'07 Aug 2026 · 04:32 PM',user:'Catherine Njeri',role:'School Accountant',action:'Fee structure updated',module:'Fees',recordId:'FS-2706',description:'Updated the Grade 6 Term 3 standard fee structure.',severity:'Warning',changes:[{field:'Lunch programme',before:'KSh 2,500',after:'KSh 3,000'}],ipAddress:'192.168.1.24'},
 {id:'AUD-260807-004',timestamp:'07 Aug 2026 · 02:15 PM',user:'Dr. James Mwangi',role:'Principal',action:'Expense approved',module:'Expenses',recordId:'EXP-203',description:'Approved Term 2 food supplies from Fresh Harvest Ltd.',severity:'Success',changes:[{field:'Status',before:'Pending',after:'Approved'}],ipAddress:'192.168.1.11'},
 {id:'AUD-260806-005',timestamp:'06 Aug 2026 · 11:06 AM',user:'Catherine Njeri',role:'School Accountant',action:'Invoice batch generated',module:'Fees',recordId:'BAT-260501',description:'Generated 146 Grade 6 student invoices for Term 2.',severity:'Success',ipAddress:'192.168.1.24'},
 {id:'AUD-260805-006',timestamp:'05 Aug 2026 · 08:44 AM',user:'System',role:'Automated process',action:'Daily reconciliation completed',module:'System',recordId:'REC-260805',description:'Reconciled 42 M-Pesa transactions with no discrepancies.',severity:'Info',ipAddress:'System'},
]
export const initialRoles:StaffRole[]=[
 {id:'ROLE-ADMIN',name:'Administrator',description:'Full access to school configuration and finance operations.',members:1,color:'#234b78',system:true,permissions:{Dashboard:'View',Students:'Manage',Fees:'Manage',Payments:'Manage',Expenses:'Approve',Budgets:'Approve',Reports:'Manage',Audit:'View',Team:'Manage'}},
 {id:'ROLE-ACCOUNTANT',name:'Accountant',description:'Manages daily fee collection, receipts, invoices and expenses.',members:2,color:'#1f6b50',system:true,permissions:{Dashboard:'View',Students:'Manage',Fees:'Manage',Payments:'Manage',Expenses:'Manage',Budgets:'View',Reports:'Manage',Audit:'View',Team:'None'}},
 {id:'ROLE-PRINCIPAL',name:'Principal',description:'Leadership oversight with expense and budget approval rights.',members:1,color:'#996e18',system:true,permissions:{Dashboard:'View',Students:'View',Fees:'View',Payments:'View',Expenses:'Approve',Budgets:'Approve',Reports:'View',Audit:'View',Team:'View'}},
 {id:'ROLE-AUDITOR',name:'Auditor',description:'Read-only access to financial records, reports and audit history.',members:1,color:'#73589a',system:true,permissions:{Dashboard:'View',Students:'View',Fees:'View',Payments:'View',Expenses:'View',Budgets:'View',Reports:'View',Audit:'View',Team:'None'}},
 {id:'ROLE-BURSAR',name:'Bursar',description:'Fee collection and student account support.',members:1,color:'#b55a4f',permissions:{Dashboard:'View',Students:'View',Fees:'View',Payments:'Manage',Expenses:'None',Budgets:'None',Reports:'View',Audit:'None',Team:'None'}}
]
export const initialStaff:StaffMember[]=[
 {id:'USR-001',name:'Catherine Njeri',email:'c.njeri@greenfield.ac.ke',phone:'+254 712 410 822',roleId:'ROLE-ACCOUNTANT',status:'Active',lastActive:'Now',initials:'CN',color:'#dceee6'},
 {id:'USR-002',name:'Dr. James Mwangi',email:'principal@greenfield.ac.ke',phone:'+254 722 840 110',roleId:'ROLE-PRINCIPAL',status:'Active',lastActive:'12 minutes ago',initials:'JM',color:'#fff0d1'},
 {id:'USR-003',name:'Peter Ochieng',email:'p.ochieng@greenfield.ac.ke',phone:'+254 733 204 190',roleId:'ROLE-ADMIN',status:'Active',lastActive:'Yesterday, 4:12 PM',initials:'PO',color:'#dce8f5'},
 {id:'USR-004',name:'Lucy Wambui',email:'l.wambui@greenfield.ac.ke',phone:'+254 701 662 348',roleId:'ROLE-BURSAR',status:'Active',lastActive:'38 minutes ago',initials:'LW',color:'#f8dfdb'},
 {id:'USR-005',name:'John Mutua',email:'j.mutua@auditpartners.co.ke',phone:'+254 720 115 784',roleId:'ROLE-AUDITOR',status:'Active',lastActive:'04 Aug 2026',initials:'JM',color:'#e8def5'},
 {id:'USR-006',name:'Esther Kamene',email:'e.kamene@greenfield.ac.ke',phone:'+254 711 442 520',roleId:'ROLE-ACCOUNTANT',status:'Invited',lastActive:'Invitation sent 2 hours ago',initials:'EK',color:'#e2eee9'}
]
export const initialSchoolSettings:SchoolSettings={schoolName:'Greenfield Academy',registrationNumber:'MOE/PRI/KE/08421',motto:'Learning today, leading tomorrow',email:'finance@greenfield.ac.ke',phone:'+254 709 440 200',address:'P.O. Box 1245-00100, Nairobi',county:'Nairobi',country:'Kenya',currency:'KES',timezone:'Africa/Nairobi',academicYear:2026,currentTerm:'Term 2',termStart:'2026-05-06',termEnd:'2026-08-30',invoicePrefix:'INV',receiptPrefix:'RCT',paymentMethods:['M-Pesa','Bank','Cash','Cheque'],receiptFooter:'Thank you for supporting your child’s education.',requireExpenseApproval:true,expenseApprovalLimit:10000,smsReminders:true,emailReceipts:true,overdueReminders:true,reminderDays:3,twoFactorAuth:false,sessionTimeout:30,passwordExpiry:90}
