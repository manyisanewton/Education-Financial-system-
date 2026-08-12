import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { CurrentUser, RequirePermissions } from '../auth/auth.decorators'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import { SaveRoleDto } from './dto/save-role.dto'
import { RolesService } from './roles.service'

@Controller('roles')
@RequirePermissions('team.manage')
export class RolesController {
  constructor(private readonly roles: RolesService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.roles.list(user) }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: SaveRoleDto, @Req() request: Request) { return this.roles.create(user, dto, this.context(request)) }
  @Patch(':roleId') update(@CurrentUser() user: AuthenticatedUser, @Param('roleId') roleId: string, @Body() dto: SaveRoleDto, @Req() request: Request) { return this.roles.update(user, roleId, dto, this.context(request)) }
  private context(request: Request): RequestContext { return { ipAddress: request.ip, requestId: request.id?.toString(), userAgent: request.headers['user-agent'] } }
}
