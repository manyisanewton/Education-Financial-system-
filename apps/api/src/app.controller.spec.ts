import { Test } from '@nestjs/testing'
import { AppController } from './app.controller'
describe('AppController',()=>{it('returns API information',async()=>{const module=await Test.createTestingModule({controllers:[AppController]}).compile();expect(module.get(AppController).info()).toEqual({name:'ShuleFinance API',version:'0.2.0',status:'operational'})})})
