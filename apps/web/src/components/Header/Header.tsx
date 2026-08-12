import { useApp } from '../../context/AppContext'
import './Header.css'

export default function Header() {
  const { language,setLanguage,t,setSidebarOpen }=useApp()
  return <header className="header"><button className="header__menu" onClick={()=>setSidebarOpen(true)} aria-label="Open menu"><span className="material-symbols-rounded">menu</span></button><div className="header__search"><span className="material-symbols-rounded">search</span><input placeholder={t('search')}/><kbd>⌘ K</kbd></div><div className="header__actions"><div className="language"><button className={language==='en'?'active':''} onClick={()=>setLanguage('en')}>EN</button><button className={language==='sw'?'active':''} onClick={()=>setLanguage('sw')}>SW</button></div><button className="icon-button" title={t('notifications')}><span className="material-symbols-rounded">notifications</span><i/></button><div className="header__school"><div className="school-icon"><span className="material-symbols-rounded">school</span></div><div><strong>{t('school')}</strong><span>{t('academic')}</span></div><span className="material-symbols-rounded">expand_more</span></div></div></header>
}
