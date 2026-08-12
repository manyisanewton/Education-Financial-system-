import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { StaffMember } from '../types'
import { ApiError, apiRequest, schoolCode } from '../services/api'

interface ApiUser { id:string; email:string; firstName:string; lastName:string; name?:string; phone?:string|null; roles:string[]; permissions:Record<string,string> }
interface AuthContextValue { user:StaffMember|null; permissions:Record<string,string>; hasPermission:(permission:string)=>boolean; refreshIdentity:()=>Promise<void>; login:(email:string,password:string,remember:boolean)=>Promise<{success:boolean;message?:string}>; logout:()=>Promise<void>; loading:boolean }
const AuthContext=createContext<AuthContextValue|null>(null)
const roleIds:Record<string,string>={Administrator:'ROLE-ADMIN',Accountant:'ROLE-ACCOUNTANT',Principal:'ROLE-PRINCIPAL',Auditor:'ROLE-AUDITOR',Bursar:'ROLE-BURSAR'}

function toStaffMember(user:ApiUser):StaffMember { const name=user.name||`${user.firstName} ${user.lastName}`;return{id:user.id,name,email:user.email,phone:user.phone||'',roleId:roleIds[user.roles[0]]||user.roles[0]||'ROLE-STAFF',status:'Active',lastActive:'Now',initials:name.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase(),color:'#dceee6'} }

export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<StaffMember|null>(null);const [permissions,setPermissions]=useState<Record<string,string>>({});const [loading,setLoading]=useState(true)
 const applyUser=useCallback((apiUser:ApiUser)=>{setUser(toStaffMember(apiUser));setPermissions(apiUser.permissions||{})},[])
 const refreshIdentity=useCallback(async()=>{const result=await apiRequest<{user:ApiUser}>('/auth/me');applyUser(result.user)},[applyUser])
 useEffect(()=>{let active=true;(async()=>{try{const result=await apiRequest<{user:ApiUser}>('/auth/me');if(active)applyUser(result.user)}catch(error){if(error instanceof ApiError&&error.status===401){try{const result=await apiRequest<{user:ApiUser}>('/auth/refresh',{method:'POST'});if(active)applyUser(result.user)}catch{if(active){setUser(null);setPermissions({})}}}}finally{if(active)setLoading(false)}})();return()=>{active=false}},[applyUser])
 const login=useCallback(async(email:string,password:string,remember:boolean)=>{setLoading(true);try{const result=await apiRequest<{user:ApiUser}>('/auth/login',{method:'POST',body:JSON.stringify({email:email.trim(),password,rememberMe:remember,schoolCode})});applyUser(result.user);return{success:true}}catch(error){return{success:false,message:error instanceof Error?error.message:'Unable to sign in.'}}finally{setLoading(false)}},[applyUser])
 const logout=useCallback(async()=>{try{await apiRequest('/auth/logout',{method:'POST'})}finally{setUser(null);setPermissions({})}},[])
 const hasPermission=useCallback((permission:string)=>Boolean(permissions[permission]&&permissions[permission]!=='NONE'),[permissions])
 const value=useMemo(()=>({user,permissions,hasPermission,refreshIdentity,login,logout,loading}),[user,permissions,hasPermission,refreshIdentity,login,logout,loading]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used inside AuthProvider');return context}
