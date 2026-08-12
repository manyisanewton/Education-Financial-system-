import { validateEnvironment } from './environment'

const base={
 DATABASE_URL:'postgresql://user:password@database:5432/shulefinance',
 REDIS_URL:'redis://cache:6379',
 JWT_ACCESS_SECRET:'a-private-secret-longer-than-thirty-two-characters',
}

describe('environment hardening',()=>{
 it('accepts safe production settings',()=>{
  expect(validateEnvironment({...base,NODE_ENV:'production',CORS_ORIGINS:'https://finance.example.test',COOKIE_SECURE:'true',TRUST_PROXY:'true',METRICS_TOKEN:'private-metrics-token-longer-than-24'}).NODE_ENV).toBe('production')
 })

 it.each([
  [{COOKIE_SECURE:'false'},'COOKIE_SECURE'],
  [{TRUST_PROXY:'false'},'TRUST_PROXY'],
  [{METRICS_TOKEN:undefined},'METRICS_TOKEN'],
  [{CORS_ORIGINS:'http://localhost:5173'},'CORS_ORIGINS'],
  [{JWT_ACCESS_SECRET:'replace-with-a-production-secret-value'},'JWT_ACCESS_SECRET'],
 ])('rejects unsafe production configuration %o',(override,field)=>{
  expect(()=>validateEnvironment({...base,NODE_ENV:'production',CORS_ORIGINS:'https://finance.example.test',COOKIE_SECURE:'true',TRUST_PROXY:'true',METRICS_TOKEN:'private-metrics-token-longer-than-24',...override})).toThrow(field)
 })
})
