import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator'
import { PaymentMethod, RecordStatus } from '@shulefinance/database'
export class ExpenseQueryDto { @IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1; @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) pageSize=50; @IsOptional() @IsString() search?:string; @IsOptional() @IsEnum(RecordStatus) status?:RecordStatus }
export class CreateExpenseDto { @IsString() @Length(3,200) description!:string; @IsString() @Length(2,100) category!:string; @IsString() @Length(2,160) vendor!:string; @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number; @IsDateString() incurredAt!:string; @IsOptional() @IsEnum(PaymentMethod) paymentMethod?:PaymentMethod; @IsOptional() @IsString() @Length(1,120) reference?:string; @IsOptional() @IsString() @Length(1,500) notes?:string; @IsOptional() @IsString() @Length(1,200) documentName?:string }
export class ReviewExpenseDto { @IsEnum(RecordStatus) decision!:'APPROVED'|'REJECTED'; @IsString() @Length(2,500) note!:string }
export class SaveVendorDto { @IsString() @Length(2,160) name!:string; @IsOptional() @IsString() @Length(3,160) email?:string; @IsOptional() @IsString() @Length(7,30) phone?:string }
export class SaveCategoryDto { @IsString() @Length(2,100) name!:string }
export class BudgetItemDto { @IsString() @Length(2,100) category!:string; @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) allocated!:number }
export class SaveBudgetDto { @IsString() @Length(3,160) name!:string; @IsString() @Length(2,30) term!:string; @Type(()=>Number) @IsInt() @Min(2000) @Max(2200) year!:number; @IsEnum(RecordStatus) status!:'DRAFT'|'PENDING'; @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({each:true}) @Type(()=>BudgetItemDto) items!:BudgetItemDto[] }
export class ReviewBudgetDto { @IsEnum(RecordStatus) decision!:'APPROVED'|'REJECTED'; @IsOptional() @IsString() @Length(2,500) note?:string }
