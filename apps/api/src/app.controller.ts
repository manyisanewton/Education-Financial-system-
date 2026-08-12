import { Controller, Get } from '@nestjs/common'
import { Public } from './auth/auth.decorators'
@Controller()
export class AppController{@Public()@Get()info(){return{name:'ShuleFinance API',version:'0.2.0',status:'operational'}}}
