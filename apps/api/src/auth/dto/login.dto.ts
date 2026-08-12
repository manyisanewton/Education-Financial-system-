import { IsBoolean, IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(1)
  password!: string

  @IsString()
  @Length(3, 100)
  schoolCode!: string

  @IsOptional()
  @IsBoolean()
  rememberMe = false
}
