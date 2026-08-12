import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { DatabaseService } from '../database/database.service'
import type { Environment } from '../config/environment'
import type { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto'
import type { LoginDto } from './dto/login.dto'
import type { AccessTokenPayload, AuthenticatedUser, RequestContext } from './auth.types'

const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5eJfaN4Y3hF2QpY5CRt8uJvVZ1hQfhi'
const PASSWORD_ROUNDS = 12

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService, private readonly jwt: JwtService, private readonly config: ConfigService<Environment, true>) {}

  async login(dto: LoginDto, context: RequestContext) {
    const email = dto.email.trim().toLowerCase()
    const school = await this.database.school.findUnique({ where: { registrationNumber: dto.schoolCode.trim() } })
    const user = school ? await this.database.user.findUnique({
      where: { schoolId_email: { schoolId: school.id, email } },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    }) : null
    const validPassword = await compare(dto.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)
    if (!school || !user || !validPassword) {
      if (school && user) await this.registerFailedLogin(user.id, user.schoolId, context)
      throw new UnauthorizedException('Invalid school, email, or password')
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) throw new HttpException('Account temporarily locked. Try again later.', HttpStatus.TOO_MANY_REQUESTS)
    if (user.status !== 'ACTIVE') throw new ForbiddenException('This account is not active. Contact your administrator.')

    const days = dto.rememberMe ? this.config.get('REMEMBER_ME_DAYS', { infer: true }) : this.config.get('REFRESH_TOKEN_DAYS', { infer: true })
    const refreshToken = randomBytes(48).toString('base64url')
    const refreshTokenHash = this.hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + days * 86_400_000)
    const session = await this.database.$transaction(async transaction => {
      await transaction.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } })
      const created = await transaction.authSession.create({ data: { userId: user.id, refreshTokenHash, expiresAt, userAgent: context.userAgent, ipAddress: context.ipAddress } })
      await transaction.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'AUTH_LOGIN_SUCCEEDED', module: 'Authentication', recordType: 'AuthSession', recordId: created.id, ipAddress: context.ipAddress, requestId: context.requestId, metadata: { userAgent: context.userAgent ?? null } } })
      return created
    })
    return { accessToken: await this.issueAccessToken(user.id, user.schoolId, session.id), refreshToken, refreshDays: days, user: this.presentUser(user, session.id) }
  }

  async refresh(refreshToken: string | undefined, context: RequestContext) {
    if (!refreshToken) throw new UnauthorizedException('Refresh session is missing')
    const tokenHash = this.hashToken(refreshToken)
    const existing = await this.database.authSession.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
    })
    if (!existing) throw new UnauthorizedException('Refresh session is invalid')
    if (existing.revokedAt) {
      await this.database.authSession.updateMany({ where: { userId: existing.userId, revokedAt: null }, data: { revokedAt: new Date() } })
      throw new UnauthorizedException('Refresh token reuse detected; all sessions were revoked')
    }
    if (existing.expiresAt <= new Date() || existing.user.status !== 'ACTIVE') throw new UnauthorizedException('Refresh session is expired or inactive')
    const replacement = randomBytes(48).toString('base64url')
    const replacementHash = this.hashToken(replacement)
    const remainingDays = Math.max(1, Math.ceil((existing.expiresAt.getTime() - Date.now()) / 86_400_000))
    const session = await this.database.$transaction(async transaction => {
      await transaction.authSession.update({ where: { id: existing.id }, data: { revokedAt: new Date(), lastUsedAt: new Date() } })
      return transaction.authSession.create({ data: { userId: existing.userId, refreshTokenHash: replacementHash, expiresAt: existing.expiresAt, userAgent: context.userAgent, ipAddress: context.ipAddress } })
    })
    return { accessToken: await this.issueAccessToken(existing.userId, existing.user.schoolId, session.id), refreshToken: replacement, refreshDays: remainingDays, user: this.presentUser(existing.user, session.id) }
  }

  async logout(refreshToken: string | undefined, actor: AuthenticatedUser | undefined, context: RequestContext) {
    if (refreshToken) {
      const session = await this.database.authSession.findUnique({ where: { refreshTokenHash: this.hashToken(refreshToken) } })
      if (session && !session.revokedAt) {
        await this.database.$transaction([
          this.database.authSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } }),
          this.database.auditEvent.create({ data: { schoolId: actor?.schoolId ?? (await this.database.user.findUniqueOrThrow({ where: { id: session.userId }, select: { schoolId: true } })).schoolId, actorId: session.userId, action: 'AUTH_LOGOUT', module: 'Authentication', recordType: 'AuthSession', recordId: session.id, ipAddress: context.ipAddress, requestId: context.requestId } }),
        ])
      }
    }
    return { message: 'Signed out' }
  }

  async forgotPassword(dto: ForgotPasswordDto, context: RequestContext) {
    const school = await this.database.school.findUnique({ where: { registrationNumber: dto.schoolCode.trim() } })
    const user = school ? await this.database.user.findUnique({ where: { schoolId_email: { schoolId: school.id, email: dto.email.trim().toLowerCase() } } }) : null
    let developmentToken: string | undefined
    if (user?.status === 'ACTIVE') {
      const token = randomBytes(48).toString('base64url')
      await this.database.$transaction([
        this.database.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
        this.database.passwordResetToken.create({ data: { userId: user.id, tokenHash: this.hashToken(token), expiresAt: new Date(Date.now() + 30 * 60_000) } }),
        this.database.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'AUTH_PASSWORD_RESET_REQUESTED', module: 'Authentication', recordType: 'User', recordId: user.id, ipAddress: context.ipAddress, requestId: context.requestId } }),
      ])
      if (this.config.get('NODE_ENV', { infer: true }) === 'development') developmentToken = token
    }
    return { message: 'If the account exists, password reset instructions will be sent.', ...(developmentToken ? { developmentToken } : {}) }
  }

  async resetPassword(dto: ResetPasswordDto, context: RequestContext) {
    const reset = await this.database.passwordResetToken.findUnique({ where: { tokenHash: this.hashToken(dto.token) }, include: { user: true } })
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new UnauthorizedException('Password reset token is invalid or expired')
    if (await compare(dto.password, reset.user.passwordHash)) throw new ConflictException('New password must be different from the current password')
    const passwordHash = await hash(dto.password, PASSWORD_ROUNDS)
    await this.database.$transaction([
      this.database.user.update({ where: { id: reset.userId }, data: { passwordHash, passwordChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null } }),
      this.database.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      this.database.authSession.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.database.auditEvent.create({ data: { schoolId: reset.user.schoolId, actorId: reset.userId, action: 'AUTH_PASSWORD_RESET_COMPLETED', module: 'Authentication', recordType: 'User', recordId: reset.userId, ipAddress: context.ipAddress, requestId: context.requestId } }),
    ])
    return { message: 'Password changed. Sign in with your new password.' }
  }

  async changePassword(user: AuthenticatedUser, dto: ChangePasswordDto, context: RequestContext) {
    const record = await this.database.user.findUniqueOrThrow({ where: { id: user.id } })
    if (!await compare(dto.currentPassword, record.passwordHash)) throw new UnauthorizedException('Current password is incorrect')
    if (await compare(dto.newPassword, record.passwordHash)) throw new ConflictException('New password must be different from the current password')
    await this.database.$transaction([
      this.database.user.update({ where: { id: user.id }, data: { passwordHash: await hash(dto.newPassword, PASSWORD_ROUNDS), passwordChangedAt: new Date() } }),
      this.database.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.database.auditEvent.create({ data: { schoolId: user.schoolId, actorId: user.id, action: 'AUTH_PASSWORD_CHANGED', module: 'Authentication', recordType: 'User', recordId: user.id, ipAddress: context.ipAddress, requestId: context.requestId } }),
    ])
    return { message: 'Password changed. Please sign in again.' }
  }

  private async registerFailedLogin(userId: string, schoolId: string, context: RequestContext) {
    const user = await this.database.user.findUniqueOrThrow({ where: { id: userId } })
    const attempts = user.failedLoginAttempts + 1
    const max = this.config.get('AUTH_MAX_ATTEMPTS', { infer: true })
    const lockedUntil = attempts >= max ? new Date(Date.now() + this.config.get('AUTH_LOCK_MINUTES', { infer: true }) * 60_000) : undefined
    await this.database.$transaction([
      this.database.user.update({ where: { id: userId }, data: { failedLoginAttempts: lockedUntil ? 0 : attempts, lockedUntil } }),
      this.database.auditEvent.create({ data: { schoolId, actorId: userId, action: lockedUntil ? 'AUTH_ACCOUNT_LOCKED' : 'AUTH_LOGIN_FAILED', module: 'Authentication', recordType: 'User', recordId: userId, ipAddress: context.ipAddress, requestId: context.requestId, metadata: { attempts } } }),
    ])
  }

  private async issueAccessToken(userId: string, schoolId: string, sessionId: string) {
    const payload: AccessTokenPayload = { sub: userId, schoolId, sid: sessionId, type: 'access' }
    const expiresIn = this.config.get('ACCESS_TOKEN_TTL', { infer: true }) as `${number}${'s' | 'm' | 'h' | 'd'}`
    return this.jwt.signAsync(payload, { secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }), expiresIn })
  }

  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex') }

  private presentUser(user: { id: string; schoolId: string; email: string; firstName: string; lastName: string; phone: string | null; school?: { name: string; registrationNumber: string }; roles: Array<{ role: { name: string; permissions: Array<{ level: import('@shulefinance/database').RoleLevel; permission: { code: string } }> } }> }, sessionId: string) {
    const permissions: Record<string, import('@shulefinance/database').RoleLevel> = {}
    for (const membership of user.roles) for (const grant of membership.role.permissions) permissions[grant.permission.code] = grant.level
    return { id: user.id, schoolId: user.schoolId, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, name: `${user.firstName} ${user.lastName}`, roles: user.roles.map(item => item.role.name), permissions, sessionId }
  }
}
