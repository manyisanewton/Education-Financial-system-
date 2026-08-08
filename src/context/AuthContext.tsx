import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StaffMember } from '../types'
import { useApp } from './AppContext'

interface AuthContextValue { user:StaffMember|null; login:(email:string,password:string,remember:boolean)=>Promise<{success:boolean;message?:string}>; logout:()=>void; loading:boolean }
const AuthContext=createContext<AuthContextValue|null>(null)
const SESSION_KEY='shulefinance_session'

export function AuthProvider({children}:{children:ReactNode}){
 const {staff}=useApp();const [userId,setUserId]=useState<string|null>(()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY)||'null')?.userId||null}catch{return null}});const [loading,setLoading]=useState(false);const user=staff.find(member=>member.id===userId)||null
 const login=async(email:string,password:string,remember:boolean)=>{setLoading(true);await new Promise(resolve=>setTimeout(resolve,650));const member=staff.find(item=>item.email.toLowerCase()===email.trim().toLowerCase());if(!member){setLoading(false);return{success:false,message:'We could not find a staff account with this email.'}}if(member.status==='Suspended'){setLoading(false);return{success:false,message:'This account has been suspended. Contact the school administrator.'}}if(member.status==='Invited'){setLoading(false);return{success:false,message:'This invitation has not been accepted yet.'}}if(password!=='Greenfield@2026'){setLoading(false);return{success:false,message:'The password you entered is incorrect.'}}const session={userId:member.id,createdAt:Date.now()};(remember?localStorage:sessionStorage).setItem(SESSION_KEY,JSON.stringify(session));if(remember)sessionStorage.removeItem(SESSION_KEY);else localStorage.removeItem(SESSION_KEY);setUserId(member.id);setLoading(false);return{success:true}}
 const logout=()=>{localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);setUserId(null)}
 const value=useMemo(()=>({user,login,logout,loading}),[user,loading]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used inside AuthProvider');return context}
