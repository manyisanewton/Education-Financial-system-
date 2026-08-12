import { BadRequestException } from '@nestjs/common'
import { RoleLevel } from '@shulefinance/database'

export const roleModules = ['Dashboard', 'Students', 'Fees', 'Payments', 'Expenses', 'Budgets', 'Reports', 'Audit', 'Team'] as const
export type RoleModule = typeof roleModules[number]

const rank: Record<RoleLevel, number> = { NONE: 0, VIEW: 1, MANAGE: 2, APPROVE: 3 }
const permissionDefinitions: Record<RoleModule, Array<{ code: string; minimum: RoleLevel }>> = {
  Dashboard: [{ code: 'dashboard.view', minimum: RoleLevel.VIEW }],
  Students: [{ code: 'students.view', minimum: RoleLevel.VIEW }, { code: 'students.manage', minimum: RoleLevel.MANAGE }],
  Fees: [{ code: 'fees.view', minimum: RoleLevel.VIEW }, { code: 'fees.manage', minimum: RoleLevel.MANAGE }, { code: 'invoices.generate', minimum: RoleLevel.MANAGE }],
  Payments: [{ code: 'payments.view', minimum: RoleLevel.VIEW }, { code: 'payments.record', minimum: RoleLevel.MANAGE }, { code: 'payments.reverse', minimum: RoleLevel.APPROVE }],
  Expenses: [{ code: 'expenses.view', minimum: RoleLevel.VIEW }, { code: 'expenses.create', minimum: RoleLevel.MANAGE }, { code: 'expenses.approve', minimum: RoleLevel.APPROVE }],
  Budgets: [{ code: 'budgets.view', minimum: RoleLevel.VIEW }, { code: 'budgets.manage', minimum: RoleLevel.MANAGE }, { code: 'budgets.approve', minimum: RoleLevel.APPROVE }],
  Reports: [{ code: 'reports.view', minimum: RoleLevel.VIEW }, { code: 'reports.export', minimum: RoleLevel.MANAGE }],
  Audit: [{ code: 'audit.view', minimum: RoleLevel.VIEW }],
  Team: [{ code: 'team.manage', minimum: RoleLevel.MANAGE }],
}

export function parseModulePermissions(input: Record<string, unknown>): Record<RoleModule, RoleLevel> {
  const unknownModules = Object.keys(input).filter(key => !roleModules.includes(key as RoleModule))
  if (unknownModules.length) throw new BadRequestException(`Unknown permission modules: ${unknownModules.join(', ')}`)
  return Object.fromEntries(roleModules.map(module => {
    const value = String(input[module] ?? 'NONE').toUpperCase()
    if (!(value in RoleLevel)) throw new BadRequestException(`Invalid permission level for ${module}`)
    return [module, value as RoleLevel]
  })) as Record<RoleModule, RoleLevel>
}

export function permissionCodesFor(modules: Record<RoleModule, RoleLevel>) {
  return roleModules.flatMap(module => permissionDefinitions[module]
    .filter(definition => rank[modules[module]] >= rank[definition.minimum])
    .map(definition => ({ code: definition.code, level: modules[module] })))
}

export function modulesFromGrants(grants: Array<{ level: RoleLevel; permission: { code: string } }>): Record<RoleModule, RoleLevel> {
  return Object.fromEntries(roleModules.map(module => {
    const codes = new Set(permissionDefinitions[module].map(definition => definition.code))
    const levels = grants.filter(grant => codes.has(grant.permission.code)).map(grant => grant.level)
    return [module, levels.reduce((highest, level) => rank[level] > rank[highest] ? level : highest, RoleLevel.NONE)]
  })) as Record<RoleModule, RoleLevel>
}
