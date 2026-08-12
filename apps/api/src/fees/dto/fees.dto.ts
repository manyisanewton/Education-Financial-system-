import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator'
import { AdjustmentType, RecordStatus } from '@shulefinance/database'

export class FeeItemDto { @IsString() @Length(2,100) label!:string;@Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number }
export class SaveFeeStructureDto {
 @IsString() @Length(2,120) name!:string
 @IsUUID() termId!:string
 @IsOptional() @IsEnum(RecordStatus) status:RecordStatus=RecordStatus.DRAFT
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30) @ValidateNested({each:true}) @Type(()=>FeeItemDto) items!:FeeItemDto[]
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30) @IsUUID('4',{each:true}) classIds!:string[]
}
export class GenerateInvoicesDto { @IsString() @Length(8,120) idempotencyKey!:string;@IsOptional() @IsDateString() dueAt?:string }
export class FeeListQueryDto { @IsOptional() @IsString() @Length(1,100) search?:string;@IsOptional() @IsUUID() termId?:string;@IsOptional() @IsEnum(RecordStatus) status?:RecordStatus }
export class InvoiceListQueryDto { @IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1;@IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) pageSize=20;@IsOptional() @IsUUID() studentId?:string;@IsOptional() @IsEnum(RecordStatus) status?:RecordStatus }
export class ChangeInvoiceStateDto { @IsEnum(RecordStatus) status!:RecordStatus }
export class CreateCreditNoteDto { @IsString() @Length(3,240) reason!:string;@IsString() @Length(2,120) description!:string;@Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number }
export class CreateAdjustmentDto { @IsEnum(AdjustmentType) type!:AdjustmentType;@IsString() @Length(3,240) description!:string;@Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) amount!:number }
