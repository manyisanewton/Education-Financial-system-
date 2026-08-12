import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator'

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/
export const strongPasswordMessage = 'Password must be 12-128 characters and include uppercase, lowercase, number, and symbol.'

export class ForgotPasswordDto {
  @IsEmail()
  email!: string

  @IsString()
  @Length(3, 100)
  schoolCode!: string
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(32)
  token!: string

  @IsString()
  @Matches(passwordPattern, { message: strongPasswordMessage })
  password!: string
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string

  @IsString()
  @Matches(passwordPattern, { message: strongPasswordMessage })
  newPassword!: string
}
