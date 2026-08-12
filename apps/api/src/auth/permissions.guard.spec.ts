import { ForbiddenException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsGuard } from './permissions.guard'
describe('PermissionsGuard',()=>{const context=(user?:any)=>({getHandler:()=>function handler(){},getClass:()=>class Controller{},switchToHttp:()=>({getRequest:()=>({user})})}) as unknown as ExecutionContext
 it('allows every required permission',()=>{const reflector={getAllAndOverride:jest.fn().mockReturnValue(['expenses.view','expenses.approve'])} as unknown as Reflector;expect(new PermissionsGuard(reflector).canActivate(context({permissions:{'expenses.view':'VIEW','expenses.approve':'APPROVE'}}))).toBe(true)})
 it('rejects missing permissions',()=>{const reflector={getAllAndOverride:jest.fn().mockReturnValue(['payments.reverse'])} as unknown as Reflector;expect(()=>new PermissionsGuard(reflector).canActivate(context({permissions:{'payments.view':'VIEW'}}))).toThrow(ForbiddenException)})
 it('rejects NONE grants',()=>{const reflector={getAllAndOverride:jest.fn().mockReturnValue(['team.manage'])} as unknown as Reflector;expect(()=>new PermissionsGuard(reflector).canActivate(context({permissions:{'team.manage':'NONE'}}))).toThrow(ForbiddenException)})
 it('allows routes without requirements',()=>{const reflector={getAllAndOverride:jest.fn().mockReturnValue([])} as unknown as Reflector;expect(new PermissionsGuard(reflector).canActivate(context())).toBe(true)})})
