import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/config.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserStatus } from '@prisma/client';

/**
 * bcrypt with 12 rounds balances security and performance per OWASP.
 * Short-lived access tokens limit exposure if leaked.
 * Store SHA-256 hash only; never store plain refresh tokens.
 * Lockout prevents brute-force; consider CAPTCHA or 2FA for high-privilege accounts.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<JwtPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) return null;
    if (user.status !== UserStatus.ACTIVE) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return this.buildJwtPayload(user);
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; email: string; fullName: string };
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      await this.recordLoginAttempt(null, email, false, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        `Account locked until ${user.lockedUntil.toISOString()}. Try again later.`,
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user.id, email, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.recordLoginAttempt(user.id, email, true, ipAddress);

    const payload = this.buildJwtPayload(user);
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.jwtAccessExpirySeconds,
    });
    const refreshToken = uuidv4();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    const expiresIn = this.parseExpiryToSeconds(this.config.jwtAccessExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: {
        user: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (stored.user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const payload = this.buildJwtPayload(stored.user);
    const newAccessToken = this.jwt.sign(payload, {
      expiresIn: this.config.jwtAccessExpirySeconds,
    });
    const newRefreshToken = uuidv4();
    const newRefreshTokenHash = this.hashRefreshToken(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: stored.user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt,
      },
    });

    const expiresIn = this.parseExpiryToSeconds(this.config.jwtAccessExpiry);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  }

  private buildJwtPayload(user: {
    id: string;
    email: string;
    roleId: string;
    churchId: string | null;
    districtId: string | null;
    conferenceId: string | null;
    role: {
      rolePermissions: { permission: { name: string } }[];
    };
  }): JwtPayload {
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.name,
    );
    const scope: JwtPayload['scope'] = {};
    if (user.churchId) scope.churchId = user.churchId;
    if (user.districtId) scope.districtId = user.districtId;
    if (user.conferenceId) scope.conferenceId = user.conferenceId;

    return {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions,
      scope,
    };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async handleFailedLogin(
    userId: string,
    email: string,
    ipAddress?: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return;

    const attempts = user.failedLoginAttempts + 1;
    const lockoutAttempts = this.config.loginLockoutAttempts;
    const lockoutDuration = this.config.loginLockoutDuration;

    let lockedUntil: Date | null = null;
    if (attempts >= lockoutAttempts) {
      lockedUntil = new Date();
      lockedUntil.setSeconds(lockedUntil.getSeconds() + lockoutDuration);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil,
      },
    });

    await this.recordLoginAttempt(userId, email, false, ipAddress);
  }

  private async recordLoginAttempt(
    userId: string | null,
    email: string,
    success: boolean,
    ipAddress?: string,
  ): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        userId,
        email,
        success,
        ipAddress,
      },
    });
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.bcryptRounds);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  /**
   * Revoke all refresh tokens for a user. Call when role or scope changes.
   * Ensures tokens are invalidated server-side; client must re-login.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent.' };
    }

    const token = uuidv4();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`[Password Reset] ${user.email}: ${resetUrl}`);
    return { message: 'If the email exists, a reset link will be sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.hashPassword(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async acceptInvite(
    token: string,
    fullName: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; email: string; fullName: string };
  }> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const invite = await this.prisma.userInvite.findFirst({
      where: { tokenHash, acceptedAt: null },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!invite || invite.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });
    if (existingUser) {
      throw new ForbiddenException('User already exists with this email');
    }

    const passwordHash = await this.hashPassword(password);
    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          fullName,
          email: invite.email,
          passwordHash,
          roleId: invite.roleId,
          churchId: invite.churchId,
          districtId: invite.districtId,
          conferenceId: invite.conferenceId,
        },
      });
      await tx.userInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return u;
    });

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });
    if (!userWithRole) throw new ForbiddenException('Failed to create user');

    const payload = this.buildJwtPayload(userWithRole);
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.jwtAccessExpirySeconds,
    });
    const refreshToken = uuidv4();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    const expiresIn = this.parseExpiryToSeconds(this.config.jwtAccessExpiry);
    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
