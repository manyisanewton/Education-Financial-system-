const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

interface ApiEnvelope<T> { success: boolean; data: T }
interface ApiErrorEnvelope { success: false; error?: { message?: string | string[] } }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message) }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers } })
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | ApiErrorEnvelope | null
  if (!response.ok) {
    const rawMessage = payload && 'error' in payload ? payload.error?.message : undefined
    throw new ApiError((Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage) || 'The server could not complete this request.', response.status)
  }
  return (payload as ApiEnvelope<T>).data
}

export async function apiDownload(path:string,fileName:string){const response=await fetch(`${API_URL}${path}`,{credentials:'include'});if(!response.ok)throw new ApiError('The export could not be generated.',response.status);const blob=await response.blob();const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=fileName;anchor.click();URL.revokeObjectURL(url)}

export const schoolCode = import.meta.env.VITE_SCHOOL_CODE || 'MOE/PRI/KE/08421'
