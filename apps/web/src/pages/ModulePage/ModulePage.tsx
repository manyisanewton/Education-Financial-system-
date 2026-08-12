import Swal from 'sweetalert2'
import { useLocation } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader'
import { expenses, payments } from '../../data/mockData'
import { formatKES } from '../../utils/formatters'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import './ModulePage.css'

const configs:Record<string,{title:string;subtitle:string;icon:string;accent:string}>={
 '/fee-structures':{title:'Fee structures',subtitle:'Define and assign term fees by class and programme.',icon:'receipt_long',accent:'Create fee structure'},
 '/payments':{title:'Payments & receipts',subtitle:'Record, reconcile and track all incoming fee payments.',icon:'payments',accent:'Record payment'},
 '/expenses':{title:'Expense management',subtitle:'Capture school spending and manage approval workflows.',icon:'account_balance_wallet',accent:'Add expense'},
 '/budgets':{title:'Budgets',subtitle:'Plan term spending and compare budgets against actuals.',icon:'donut_large',accent:'Create budget'},
 '/reports':{title:'Financial reports',subtitle:'Clear financial insights for school leadership.',icon:'analytics',accent:'Generate report'},
 '/audit':{title:'Audit log',subtitle:'A traceable history of every financial action.',icon:'history',accent:'Export log'},
 '/team':{title:'Team & roles',subtitle:'Manage staff access and financial permissions.',icon:'group',accent:'Invite member'},
 '/settings':{title:'School settings',subtitle:'Manage Greenfield Academy’s finance preferences.',icon:'settings',accent:'Save changes'},
}

export default function ModulePage(){const {pathname}=useLocation();const c=configs[pathname]||configs['/reports'];const notify=()=>Swal.fire({title:c.accent,text:'This interaction is connected to presentation mock data.',icon:'success',confirmButtonColor:'#1f6b50'});return <div><PageHeader eyebrow="GREENFIELD ACADEMY" title={c.title} subtitle={c.subtitle} actions={<button onClick={notify} className="button button--primary"><span className="material-symbols-rounded">add</span>{c.accent}</button>}/><div className="module-grid"><section className="module-hero"><div className="module-hero__icon"><span className="material-symbols-rounded">{c.icon}</span></div><div><span>TERM 2 OVERVIEW</span><h2>{c.title} workspace</h2><p>The full workflow is prepared for progressive implementation with backend-ready data boundaries.</p></div><button onClick={notify}>Explore module <span className="material-symbols-rounded">arrow_forward</span></button></section><section className="module-stats"><div><span>Current total</span><strong>{pathname==='/expenses'?'KSh 1.85M':'KSh 3.92M'}</strong><small>Updated 5 min ago</small></div><div><span>Items this term</span><strong>{pathname==='/payments'?'1,284':'24'}</strong><small>Term 2, 2026</small></div><div><span>Needs attention</span><strong>4</strong><small>Pending review</small></div></section></div><section className="module-table panel"><div className="panel__head"><div><h2>Recent activity</h2><p>Latest records in this module</p></div><button>View all <span className="material-symbols-rounded">arrow_forward</span></button></div><div className="table-wrap"><table><thead><tr><th>Reference</th><th>Description</th><th>Category / Method</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>{(pathname==='/expenses'?expenses.map(e=>({id:e.id,name:e.description,type:e.category,date:e.date,amount:e.amount,status:e.status})):payments.map(p=>({id:p.id,name:p.student,type:p.method,date:p.date,amount:p.amount,status:p.status}))).map(row=><tr key={row.id}><td><strong>{row.id}</strong></td><td><strong>{row.name}</strong></td><td>{row.type}</td><td>{row.date}</td><td><strong>{formatKES(row.amount)}</strong></td><td><StatusBadge status={row.status}/></td></tr>)}</tbody></table></div></section></div>}
