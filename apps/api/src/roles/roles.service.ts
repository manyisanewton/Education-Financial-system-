import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, type RoleLevel } from '@shulefinance/database'
import { DatabaseService } from '../database/database.service'
import type { AuthenticatedUser, RequestContext } from '../auth/auth.types'
import type { SaveRoleDto } from './dto/save-role.dto'
import { modulesFromGrants, parseModulePermissions, permissionCodesFor } from './role-permissions'

const colors = ['#234b78', '#1f6b50', '#996e18', '#73589a', '#b55a4f', '#39737a']
type RoleRecord = Prisma.RoleGetPayload<{ include: { permissions: { include: { permission: true } }; _count: { select: { users: true } } } }>

@Injectable()
export class RolesService {
  constructor(private readonly database: DatabaseService) {}

  async list(user: AuthenticatedUser) {
    const roles = await this.database.role.findMany({ where: { schoolId: user.schoolId }, include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }, orderBy: [{ isSystem: 'desc' }, { name: 'asc' }] })
    return { roles: roles.map((role, index) => this.present(role, colors[index % colors.length])) }
  }

  async create(user: AuthenticatedUser, dto: SaveRoleDto, context: RequestContext) {
    const modules = parseModulePermissions(dto.permissions)
    const name = dto.name.trim()
    if (await this.database.role.findUnique({ where: { schoolId_name: { schoolId: user.schoolId, name } } })) throw new ConflictException('A role with this name already exists')
    const grants = await this.resolveGrants(modules)
    const role = await this.database.$transaction(async transaction => {
      const created = await transaction.role.create({ data: { schoolId: user.schoolId, name, description: dto.description.trim(), permissions: { create: grants } } })
      await transaction.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'ROLE_CREATED', module: 'Team', recordType: 'Role', recordId: created.id, after: { name, description: dto.description.trim(), permissions: modules }, ipAddress: context.ipAddress, requestId: context.requestId } })
      return transaction.role.findUniqueOrThrow({ where: { id: created.id }, include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } })
    })
    return { role: this.present(role, dto.color ?? colors[3]) }
  }

  async update(user: AuthenticatedUser, roleId: string, dto: SaveRoleDto, context: RequestContext) {
    const existing = await this.database.role.findFirst({ where: { id: roleId, schoolId: user.schoolId }, include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } })
    if (!existing) throw new NotFoundException('Role not found')
    const modules = parseModulePermissions(dto.permissions)
    const name = dto.name.trim()
    if (existing.isSystem && name !== existing.name) throw new ConflictException('System roles cannot be renamed')
    const duplicate = await this.database.role.findFirst({ where: { schoolId: user.schoolId, name, id: { not: roleId } } })
    if (duplicate) throw new ConflictException('A role with this name already exists')
    const grants = await this.resolveGrants(modules)
    const updated = await this.database.$transaction(async transaction => {
      await transaction.rolePermission.deleteMany({ where: { roleId } })
      const role = await transaction.role.update({ where: { id: roleId }, data: { name, description: dto.description.trim(), permissions: { create: grants } } })
      await transaction.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'ROLE_PERMISSIONS_UPDATED', module: 'Team', recordType: 'Role', recordId: roleId, before: { name: existing.name, description: existing.description, permissions: modulesFromGrants(existing.permissions) }, after: { name, description: dto.description.trim(), permissions: modules }, ipAddress: context.ipAddress, requestId: context.requestId } })
      return transaction.role.findUniqueOrThrow({ where: { id: role.id }, include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } })
    })
    return { role: this.present(updated, dto.color ?? colors[0]) }
  }

  private async resolveGrants(modules: ReturnType<typeof parseModulePermissions>) {
    const desired = permissionCodesFor(modules)
    const permissions = await this.database.permission.findMany({ where: { code: { in: desired.map(item => item.code) } } })
    const ids = new Map(permissions.map(permission => [permission.code, permission.id]))
    const missing = desired.filter(item => !ids.has(item.code)).map(item => item.code)
    if (missing.length) throw new ConflictException(`Permission catalogue is incomplete: ${missing.join(', ')}`)
    return desired.map(item => ({ permissionId: ids.get(item.code)!, level: item.level as RoleLevel }))
  }

  private present(role: RoleRecord, color: string) {
    const modules = modulesFromGrants(role.permissions)
    const title = (value: RoleLevel) => value.charAt(0) + value.slice(1).toLowerCase()
    return { id: role.id, name: role.name, description: role.description ?? '', members: role._count.users, color, system: role.isSystem, permissions: Object.fromEntries(Object.entries(modules).map(([module, level]) => [module, title(level)])) }
  }
}
