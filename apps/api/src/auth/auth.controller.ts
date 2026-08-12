import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import type { Environment } from '../config/environment'
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants'
import { CurrentUser, Public } from './auth.decorators'
import { AuthService } from './auth.service'
import type { AuthenticatedUser, RequestContext } from './auth.types'
import { LoginDto } from './dto/login.dto'
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService<Environment, true>) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(dto, this.context(request))
    this.setCookies(response, result.accessToken, result.refreshToken, result.refreshDays)
    return { user: result.user }
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.refresh(request.cookies?.[REFRESH_COOKIE], this.context(request))
    this.setCookies(response, result.accessToken, result.refreshToken, result.refreshDays)
    return { user: result.user }
  }

  @Public()
  @Post('logout')
  async logout(@Req() request: Request & { user?: AuthenticatedUser }, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.logout(request.cookies?.[REFRESH_COOKIE], request.user, this.context(request))
    this.clearCookies(response)
    return result
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) { return { user } }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() request: Request) { return this.auth.forgotPassword(dto, this.context(request)) }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.resetPassword(dto, this.context(request))
    this.clearCookies(response)
    return result
  }

  @Post('change-password')
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.changePassword(user, dto, this.context(request))
    this.clearCookies(response)
    return result
  }

  private setCookies(response: Response, accessToken: string, refreshToken: string, refreshDays: number) {
    const secure = this.config.get('COOKIE_SECURE', { infer: true })
    const common = { httpOnly: true, secure, sameSite: 'strict' as const }
    response.cookie(ACCESS_COOKIE, accessToken, { ...common, path: '/', maxAge: 15 * 60_000 })
    response.cookie(REFRESH_COOKIE, refreshToken, { ...common, path: '/api/v1/auth', maxAge: refreshDays * 86_400_000 })
  }

  private clearCookies(response: Response) {
    const secure = this.config.get('COOKIE_SECURE', { infer: true })
    const common = { httpOnly: true, secure, sameSite: 'strict' as const }
    response.clearCookie(ACCESS_COOKIE, { ...common, path: '/' })
    response.clearCookie(REFRESH_COOKIE, { ...common, path: '/api/v1/auth' })
  }

  private context(request: Request): RequestContext {
    return { ipAddress: request.ip, userAgent: request.headers['user-agent'], requestId: request.id?.toString() }
  }
}
