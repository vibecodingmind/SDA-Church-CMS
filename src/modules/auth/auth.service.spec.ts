import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid-v4' }));
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
import { UserStatus } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwt: jest.Mocked<JwtService>;
  let config: Partial<AppConfigService>;

  const mockUser = {
    id: 'user-1',
    fullName: 'Test User',
    email: 'test@example.com',
    passwordHash: '',
    roleId: 'role-1',
    churchId: 'church-1',
    districtId: null,
    conferenceId: null,
    status: UserStatus.ACTIVE,
    termStart: null,
    termEnd: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      id: 'role-1',
      name: 'PASTOR',
      rolePermissions: [
        { permission: { name: 'MEMBER:VIEW' } },
        { permission: { name: 'MEMBER:CREATE' } },
      ],
    },
  };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    mockUser.passwordHash = hashedPassword;

    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      loginAttempt: {
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    jwt = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
    } as unknown as jest.Mocked<JwtService>;

    config = {
      jwtAccessExpiry: '15m',
      jwtAccessExpirySeconds: 900,
      bcryptRounds: 12,
      loginLockoutAttempts: 5,
      loginLockoutDuration: 900,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: AppConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      expect(await service.validateUser('bad@email.com', 'pass')).toBeNull();
    });

    it('should return null for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      expect(
        await service.validateUser('test@example.com', 'wrongpassword'),
      ).toBeNull();
    });

    it('should return JwtPayload for valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).not.toBeNull();
      expect(result?.sub).toBe('user-1');
      expect(result?.email).toBe('test@example.com');
      expect(result?.permissions).toContain('MEMBER:VIEW');
      expect(result?.scope.churchId).toBe('church-1');
    });

    it('should return null for suspended user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: UserStatus.SUSPENDED,
      });
      expect(
        await service.validateUser('test@example.com', 'password123'),
      ).toBeNull();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.login('bad@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for locked account', async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 900000),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(lockedUser);

      await expect(
        service.login('test@example.com', 'password123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return tokens for valid login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});
      (prisma.loginAttempt.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(
        'test@example.com',
        'password123',
        '127.0.0.1',
      );

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      const hash = await service.hashPassword('mypassword');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('mypassword');
      expect(await bcrypt.compare('mypassword', hash)).toBe(true);
    });
  });
});
