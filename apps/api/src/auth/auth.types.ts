import type { RoleLevel } from '@shulefinance/database'

export interface AccessTokenPayload {
  sub: string
  sid: string
  schoolId: string
  type: 'access'
}

export interface AuthenticatedUser {
  id: string
  schoolId: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  permissions: Record<string, RoleLevel>
  sessionId: string
}

export interface RequestContext {
  ipAddress?: string
  userAgent?: string
  requestId?: string
}
