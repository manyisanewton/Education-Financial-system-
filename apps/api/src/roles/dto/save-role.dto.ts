import { IsHexColor, IsNotEmpty, IsObject, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class SaveRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  name!: string

  @IsString()
  @MaxLength(240)
  description!: string

  @IsOptional()
  @IsHexColor()
  color?: string

  @IsObject()
  permissions!: Record<string, unknown>
}
