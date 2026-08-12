import type { TranslationKey } from '../i18n/translations'

export interface ModuleNavigationItem {
  path: string
  label: TranslationKey
  icon: string
  permission: string
}

export const workspaceModules: ModuleNavigationItem[] = [
  { path: '/', label: 'dashboard', icon: 'dashboard', permission: 'dashboard.view' },
  { path: '/students', label: 'students', icon: 'school', permission: 'students.view' },
  { path: '/fee-structures', label: 'fees', icon: 'receipt_long', permission: 'fees.view' },
  { path: '/payments', label: 'payments', icon: 'payments', permission: 'payments.view' },
  { path: '/expenses', label: 'expenses', icon: 'account_balance_wallet', permission: 'expenses.view' },
  { path: '/budgets', label: 'budgets', icon: 'donut_large', permission: 'budgets.view' },
  { path: '/reports', label: 'reports', icon: 'analytics', permission: 'reports.view' },
  { path: '/audit', label: 'audit', icon: 'history', permission: 'audit.view' },
]

export const systemModules: ModuleNavigationItem[] = [
  { path: '/team', label: 'team', icon: 'group', permission: 'team.manage' },
  { path: '/settings', label: 'settings', icon: 'settings', permission: 'settings.manage' },
]

export const allModules = [...workspaceModules, ...systemModules]
