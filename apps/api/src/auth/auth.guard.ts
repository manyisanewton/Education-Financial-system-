import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { DatabaseService } from '../database/database.service'
import type { Environment } from '../config/environment'
import { ACCESS_COOKIE, IS_PUBLIC_KEY } from './auth.constants'
import type { AccessTokenPayload, AuthenticatedUser } from './auth.types'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService, private readonly database: DatabaseService, private readonly config: ConfigService<Environment, true>) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>()
    const bearer = request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.slice(7) : undefined
    const token = request.cookies?.[ACCESS_COOKIE] ?? bearer
    if (!token) throw new UnauthorizedException('Authentication required')
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, { secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }) })
      if (payload.type !== 'access') throw new Error('Invalid token type')
      const session = await this.database.authSession.findFirst({
        where: { id: payload.sid, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
        include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
      })
      if (!session || session.user.status !== 'ACTIVE' || session.user.schoolId !== payload.schoolId) throw new Error('Inactive session')
      const permissions: AuthenticatedUser['permissions'] = {}
      for (const membership of session.user.roles) for (const grant of membership.role.permissions) permissions[grant.permission.code] = grant.level
      request.user = { id: session.user.id, schoolId: session.user.schoolId, email: session.user.email, firstName: session.user.firstName, lastName: session.user.lastName, roles: session.user.roles.map(item => item.role.name), permissions, sessionId: session.id }
      return true
    } catch {
      throw new UnauthorizedException('Session is invalid or expired')
    }
  }
}
