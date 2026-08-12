import { Module } from '@nestjs/common'
import { ExpenditureController } from './expenditure.controller'
import { ExpenditureService } from './expenditure.service'
@Module({controllers:[ExpenditureController],providers:[ExpenditureService]})
export class ExpenditureModule{}
