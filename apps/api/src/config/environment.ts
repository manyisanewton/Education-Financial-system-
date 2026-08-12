import { z } from 'zod'

const environmentSchema=z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'),
 PORT:z.coerce.number().int().min(1).max(65535).default(4000),
 API_PREFIX:z.string().default('api/v1'),
 DATABASE_URL:z.string().min(1),
 REDIS_URL:z.string().url(),
 CORS_ORIGINS:z.string().default('http://localhost:5173'),
 LOG_LEVEL:z.enum(['fatal','error','warn','info','debug','trace','silent']).default('info'),
 JWT_ACCESS_SECRET:z.string().min(32),
 ACCESS_TOKEN_TTL:z.string().regex(/^\d+[smhd]$/).default('15m'),
 REFRESH_TOKEN_DAYS:z.coerce.number().int().min(1).max(30).default(7),
 REMEMBER_ME_DAYS:z.coerce.number().int().min(1).max(90).default(30),
 AUTH_MAX_ATTEMPTS:z.coerce.number().int().min(3).max(20).default(5),
 AUTH_LOCK_MINUTES:z.coerce.number().int().min(1).max(1440).default(15),
 COOKIE_SECURE:z.enum(['true','false']).transform(value=>value==='true').default(false),
 SCHOOL_REGISTRATION_NUMBER:z.string().min(1).default('MOE/PRI/KE/08421'),
 METRICS_TOKEN:z.string().min(24).optional(),
 TRUST_PROXY:z.enum(['true','false']).transform(value=>value==='true').default(false),
}).superRefine((environment,context)=>{
 if(environment.NODE_ENV!=='production')return
 if(!environment.COOKIE_SECURE)context.addIssue({code:'custom',path:['COOKIE_SECURE'],message:'must be true in production'})
 if(!environment.TRUST_PROXY)context.addIssue({code:'custom',path:['TRUST_PROXY'],message:'must be true in production behind the deployment proxy'})
 if(!environment.METRICS_TOKEN)context.addIssue({code:'custom',path:['METRICS_TOKEN'],message:'is required in production'})
 if(environment.JWT_ACCESS_SECRET.toLowerCase().includes('replace-with'))context.addIssue({code:'custom',path:['JWT_ACCESS_SECRET'],message:'must not use the example value in production'})
 const origins=environment.CORS_ORIGINS.split(',').map(origin=>origin.trim())
 if(origins.some(origin=>origin==='*'||/localhost|127\.0\.0\.1/i.test(origin)))context.addIssue({code:'custom',path:['CORS_ORIGINS'],message:'must contain only explicit production origins'})
})
export type Environment=z.infer<typeof environmentSchema>
export function validateEnvironment(values:Record<string,unknown>){const result=environmentSchema.safeParse(values);if(!result.success)throw new Error(`Invalid environment configuration: ${result.error.issues.map(issue=>`${issue.path.join('.')}: ${issue.message}`).join('; ')}`);return result.data}
