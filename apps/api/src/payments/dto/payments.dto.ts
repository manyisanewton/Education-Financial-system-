import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator'
import { PaymentMethod, TransactionStatus } from '@shulefinance/database'

export class PaymentAllocationDto { @IsUUID() invoiceId!:string; @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number }
export class CapturePaymentDto {
 @IsUUID() studentId!:string
 @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number
 @IsEnum(PaymentMethod) method!:PaymentMethod
 @IsString() @Length(2,120) reference!:string
 @IsString() @Length(8,120) idempotencyKey!:string
 @IsOptional() @IsDateString() receivedAt?:string
 @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({each:true}) @Type(()=>PaymentAllocationDto) allocations?:PaymentAllocationDto[]
}
export class PaymentListQueryDto { @IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1; @IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) pageSize=50; @IsOptional() @IsString() @Length(1,120) search?:string; @IsOptional() @IsEnum(PaymentMethod) method?:PaymentMethod; @IsOptional() @IsEnum(TransactionStatus) status?:TransactionStatus }
export class ReversePaymentDto { @IsString() @Length(3,240) reason!:string; @IsString() @Length(8,120) idempotencyKey!:string }
export class ReconciliationEntryDto { @IsString() @Length(2,120) reference!:string; @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number }
export class CreateReconciliationDto { @IsString() @Length(2,120) name!:string; @IsDateString() periodStart!:string; @IsDateString() periodEnd!:string; @IsArray() @ArrayMinSize(1) @ArrayMaxSize(1000) @ValidateNested({each:true}) @Type(()=>ReconciliationEntryDto) entries!:ReconciliationEntryDto[] }
