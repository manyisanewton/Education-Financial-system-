import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'
export default function ProtectedRoute({children}:{children:ReactNode}){const {user,loading}=useAuth();const location=useLocation();if(loading)return <div className="route-loading" aria-label="Restoring secure session"/>;return user?<>{children}</>:<Navigate to="/login" replace state={{from:location.pathname}}/>}
