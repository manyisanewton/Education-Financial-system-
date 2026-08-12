import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import './AppLayout.css'
export default function AppLayout(){return <><Sidebar/><Header/><main className="app-main"><Outlet/></main></>}
