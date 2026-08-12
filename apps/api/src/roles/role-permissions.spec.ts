import { BadRequestException } from '@nestjs/common'
import { RoleLevel } from '@shulefinance/database'
import { parseModulePermissions, permissionCodesFor } from './role-permissions'

describe('role permission mapping', () => {
  it('grants only read codes at View level', () => {
    const modules = parseModulePermissions({ Payments: 'View' })
    expect(permissionCodesFor(modules).map(item => item.code)).toEqual(['payments.view'])
  })

  it('adds sensitive actions only at Approve level', () => {
    const modules = parseModulePermissions({ Payments: 'Approve', Expenses: 'Approve' })
    expect(permissionCodesFor(modules)).toEqual(expect.arrayContaining([
      { code: 'payments.reverse', level: RoleLevel.APPROVE },
      { code: 'expenses.approve', level: RoleLevel.APPROVE },
    ]))
  })

  it('does not grant team management for View', () => {
    const modules = parseModulePermissions({ Team: 'View' })
    expect(permissionCodesFor(modules).some(item => item.code === 'team.manage')).toBe(false)
  })

  it('rejects unknown modules', () => {
    expect(() => parseModulePermissions({ Payroll: 'Approve' })).toThrow(BadRequestException)
  })
})
