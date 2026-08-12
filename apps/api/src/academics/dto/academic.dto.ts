import { Type } from 'class-transformer'
import { IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, MinLength } from 'class-validator'
import { StudentStatus, TermStatus } from '@shulefinance/database'

export class PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20
  @IsOptional() @IsString() @Length(1, 100) search?: string
}

export class StudentQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() classId?: string
  @IsOptional() @IsUUID() termId?: string
  @IsOptional() @IsEnum(StudentStatus) status?: StudentStatus
}

export class SaveStudentDto {
  @IsString() @Length(2, 120) fullName!: string
  @IsString() @Length(2, 40) admissionNumber!: string
  @IsUUID() classId!: string
  @IsUUID() termId!: string
  @IsString() @Length(2, 120) guardianName!: string
  @IsString() @Length(7, 30) guardianPhone!: string
  @IsOptional() @IsEmail() guardianEmail?: string
  @IsOptional() @IsString() @Length(2, 40) relationship = 'Guardian'
  @IsOptional() @IsEnum(StudentStatus) status: StudentStatus = StudentStatus.ACTIVE
}

export class UpdateStudentDto {
  @IsOptional() @IsString() @Length(2, 120) fullName?: string
  @IsOptional() @IsString() @Length(2, 120) guardianName?: string
  @IsOptional() @IsString() @Length(7, 30) guardianPhone?: string
  @IsOptional() @IsEmail() guardianEmail?: string
  @IsOptional() @IsEnum(StudentStatus) status?: StudentStatus
  @IsOptional() @IsUUID() classId?: string
  @IsOptional() @IsUUID() termId?: string
}

export class CreateGuardianDto {
  @IsString() @Length(2, 120) fullName!: string
  @IsString() @Length(7, 30) phone!: string
  @IsOptional() @IsEmail() email?: string
}

export class CreateClassDto {
  @IsString() @Length(2, 80) name!: string
  @IsString() @Length(1, 40) grade!: string
}

export class CreateAcademicYearDto {
  @IsString() @Length(2, 30) name!: string
  @IsDateString() startsOn!: string
  @IsDateString() endsOn!: string
}

export class CreateTermDto {
  @IsUUID() academicYearId!: string
  @IsString() @Length(2, 40) name!: string
  @IsDateString() startsOn!: string
  @IsDateString() endsOn!: string
  @IsOptional() @IsEnum(TermStatus) status: TermStatus = TermStatus.PLANNED
}

export class CreateEnrolmentDto {
  @IsUUID() studentId!: string
  @IsUUID() classId!: string
  @IsUUID() termId!: string
}
