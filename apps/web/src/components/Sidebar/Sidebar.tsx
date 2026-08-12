import { NavLink, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import Logo from '../Logo/Logo'
import { systemModules, workspaceModules, type ModuleNavigationItem } from '../../config/modulePermissions'
import './Sidebar.css'

export default function Sidebar() {
  const { t, sidebarOpen, setSidebarOpen, roles } = useApp(); const { user, logout, hasPermission } = useAuth(); const navigate=useNavigate(); const role=roles.find(item=>item.id===user?.roleId)
  const signOut=()=>Swal.fire({title:'Sign out?',text:'You will need to enter your staff credentials again.',icon:'question',showCancelButton:true,confirmButtonText:'Sign out',confirmButtonColor:'#1f6b50'}).then(result=>{if(result.isConfirmed){logout();navigate('/login',{replace:true})}})
  const permittedWorkspace=workspaceModules.filter(item=>hasPermission(item.permission));const permittedSystem=systemModules.filter(item=>hasPermission(item.permission))
  const links = (items: ModuleNavigationItem[]) => items.map(item => <NavLink key={item.path} to={item.path} end={item.path==='/'} onClick={()=>setSidebarOpen(false)}><span className="material-symbols-rounded">{item.icon}</span><span>{t(item.label)}</span></NavLink>)
  return <><div className={`sidebar-overlay ${sidebarOpen?'show':''}`} onClick={()=>setSidebarOpen(false)}/><aside className={`sidebar ${sidebarOpen?'open':''}`}>
    <div className="sidebar__logo"><Logo/><button onClick={()=>setSidebarOpen(false)} aria-label="Close menu"><span className="material-symbols-rounded">close</span></button></div>
    <nav>{permittedWorkspace.length>0&&<><span className="sidebar__label">WORKSPACE</span>{links(permittedWorkspace)}</>}{permittedSystem.length>0&&<><span className="sidebar__label sidebar__label--system">SYSTEM</span>{links(permittedSystem)}</>}</nav>
    <div className="sidebar__help"><div className="sidebar__help-icon"><span className="material-symbols-rounded">support_agent</span></div><strong>{t('help')}</strong><p>Need a hand? Our team is ready.</p><button>Get support</button></div>
    <div className="sidebar__user"><div className="avatar">{user?.initials||'CN'}</div><div><strong>{user?.name||'Catherine Njeri'}</strong><span>{role?.name||t('role')}</span></div><button className="sidebar__logout" onClick={signOut} title="Sign out"><span className="material-symbols-rounded">logout</span></button></div>
  </aside></>
}
