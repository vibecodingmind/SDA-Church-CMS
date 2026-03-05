import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: NestConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET', '');
  }

  get jwtAccessExpiry(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRY', '15m');
  }

  get jwtAccessExpirySeconds(): number {
    const expiry = this.jwtAccessExpiry;
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] ?? 60);
  }

  get jwtRefreshExpiry(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRY', '7d');
  }

  get bcryptRounds(): number {
    return this.config.get<number>('BCRYPT_ROUNDS', 12);
  }

  get corsOrigins(): string[] {
    const origins = this.config.get<string>('CORS_ORIGINS', 'http://localhost:3000');
    return origins.split(',').map((o) => o.trim());
  }

  get rateLimitTtl(): number {
    return this.config.get<number>('RATE_LIMIT_TTL', 60);
  }

  get rateLimitMax(): number {
    return this.config.get<number>('RATE_LIMIT_MAX', 10);
  }

  get loginLockoutAttempts(): number {
    return this.config.get<number>('LOGIN_LOCKOUT_ATTEMPTS', 5);
  }

  get loginLockoutDuration(): number {
    return this.config.get<number>('LOGIN_LOCKOUT_DURATION', 900);
  }
}
