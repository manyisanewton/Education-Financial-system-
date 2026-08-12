import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from './auth.constants'
import type { AuthenticatedUser } from './auth.types'

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions)
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  (context.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>()).user,
)
