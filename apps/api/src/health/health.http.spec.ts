import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { HealthController } from './health.controller'
import { DatabaseService } from '../database/database.service'
describe('health HTTP contract',()=>{let app:INestApplication
 beforeAll(async()=>{const module=await Test.createTestingModule({controllers:[HealthController],providers:[{provide:DatabaseService,useValue:{$queryRaw:jest.fn().mockResolvedValue([{ok:1}])}}]}).compile();app=module.createNestApplication();await app.init()})
 afterAll(()=>app.close())
 it('returns liveness through HTTP',async()=>{const response=await request(app.getHttpServer()).get('/health/live').expect(200);expect(response.body).toMatchObject({status:'ok',service:'shulefinance-api'})})
 it('returns database readiness through HTTP',async()=>{const response=await request(app.getHttpServer()).get('/health/ready').expect(200);expect(response.body).toEqual({status:'ready',database:'connected'})})})
