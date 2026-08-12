import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { PERMISSIONS_KEY } from './auth.constants'
import type { AuthenticatedUser } from './auth.types'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? []
    if (!required.length) return true
    const user = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>().user
    if (!user || !required.every(permission => user.permissions[permission] && user.permissions[permission] !== 'NONE')) throw new ForbiddenException('You do not have permission to perform this action')
    return true
  }
}
