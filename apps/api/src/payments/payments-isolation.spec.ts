import type { AuthenticatedUser } from '../auth/auth.types'
import { PaymentsService } from './payments.service'

const user={id:'user-a',schoolId:'school-a',email:'a@example.test',firstName:'A',lastName:'User',roles:[],permissions:{},sessionId:'session'} as AuthenticatedUser

describe('payment school isolation',()=>{
 it('scopes paginated payment reads to the authenticated school',async()=>{
  const findMany=jest.fn().mockResolvedValue([])
  const count=jest.fn().mockResolvedValue(0)
  const database={payment:{findMany,count},$transaction:jest.fn(async operations=>Promise.all(operations))}
  const service=new PaymentsService(database as any)
  await service.list(user,{page:1,pageSize:20} as any)
  expect(findMany.mock.calls[0][0].where.schoolId).toBe('school-a')
  expect(count.mock.calls[0][0].where.schoolId).toBe('school-a')
 })

 it('scopes receipt lookup to the authenticated school',async()=>{
  const findFirst=jest.fn().mockResolvedValue(null)
  const service=new PaymentsService({payment:{findFirst}} as any)
  await expect(service.receipt(user,'payment-b')).rejects.toThrow('Payment not found')
  expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({where:{id:'payment-b',schoolId:'school-a'}}))
 })
})
