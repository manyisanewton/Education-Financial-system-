import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Logo from '../Logo/Logo'
import type { TranslationKey } from '../../i18n/translations'
import './Sidebar.css'

const mainItems: [string, TranslationKey, string][] = [['/','dashboard','dashboard'],['/students','students','school'],['/fee-structures','fees','receipt_long'],['/payments','payments','payments'],['/expenses','expenses','account_balance_wallet'],['/budgets','budgets','donut_large'],['/reports','reports','analytics'],['/audit','audit','history']]
const systemItems: [string, TranslationKey, string][] = [['/team','team','group'],['/settings','settings','settings']]

export default function Sidebar() {
  const { t, sidebarOpen, setSidebarOpen } = useApp()
  const links = (items: typeof mainItems) => items.map(([to,label,icon]) => <NavLink key={to} to={to} end={to==='/'} onClick={()=>setSidebarOpen(false)}><span className="material-symbols-rounded">{icon}</span><span>{t(label)}</span></NavLink>)
  return <><div className={`sidebar-overlay ${sidebarOpen?'show':''}`} onClick={()=>setSidebarOpen(false)}/><aside className={`sidebar ${sidebarOpen?'open':''}`}>
    <div className="sidebar__logo"><Logo/><button onClick={()=>setSidebarOpen(false)} aria-label="Close menu"><span className="material-symbols-rounded">close</span></button></div>
    <nav><span className="sidebar__label">WORKSPACE</span>{links(mainItems)}<span className="sidebar__label sidebar__label--system">SYSTEM</span>{links(systemItems)}</nav>
    <div className="sidebar__help"><div className="sidebar__help-icon"><span className="material-symbols-rounded">support_agent</span></div><strong>{t('help')}</strong><p>Need a hand? Our team is ready.</p><button>Get support</button></div>
    <div className="sidebar__user"><div className="avatar">CN</div><div><strong>Catherine Njeri</strong><span>{t('role')}</span></div><span className="material-symbols-rounded">more_vert</span></div>
  </aside></>
}
