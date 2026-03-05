import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.auth.hashPassword(dto.password);
    const { password: _, ...rest } = dto;
    return this.prisma.user.create({
      data: {
        ...rest,
        email: rest.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        roleId: true,
        churchId: true,
        districtId: true,
        conferenceId: true,
        status: true,
        termStart: true,
        termEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(scope: JwtPayload['scope']) {
    const where = this.scope.userWhereClause(scope);
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        roleId: true,
        churchId: true,
        districtId: true,
        conferenceId: true,
        status: true,
        termStart: true,
        termEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, scope: JwtPayload['scope']) {
    const where = this.scope.userWhereClause(scope);
    const user = await this.prisma.user.findFirst({
      where: { ...where, id },
      select: {
        id: true,
        fullName: true,
        email: true,
        roleId: true,
        churchId: true,
        districtId: true,
        conferenceId: true,
        status: true,
        termStart: true,
        termEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);

    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.passwordHash = await this.auth.hashPassword(dto.password);
    }
    delete data.password;

    const scopeOrRoleChanged =
      dto.roleId !== undefined ||
      dto.churchId !== undefined ||
      dto.districtId !== undefined ||
      dto.conferenceId !== undefined;
    if (scopeOrRoleChanged) {
      await this.auth.revokeAllUserTokens(id);
    }

    return this.prisma.user.update({
      where: { id },
      data: data as Record<string, any>,
      select: {
        id: true,
        fullName: true,
        email: true,
        roleId: true,
        churchId: true,
        districtId: true,
        conferenceId: true,
        status: true,
        termStart: true,
        termEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.ARCHIVED },
    });
    return { deleted: true };
  }

  async createInvite(dto: CreateInviteDto, scope: JwtPayload['scope']) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const { v4: uuidv4 } = await import('uuid');
    const { createHash } = await import('crypto');
    const token = uuidv4();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.userInvite.upsert({
      where: { email: dto.email.toLowerCase() },
      create: {
        email: dto.email.toLowerCase(),
        roleId: dto.roleId,
        churchId: dto.churchId,
        districtId: dto.districtId,
        conferenceId: dto.conferenceId,
        tokenHash,
        expiresAt,
      },
      update: {
        roleId: dto.roleId,
        churchId: dto.churchId,
        districtId: dto.districtId,
        conferenceId: dto.conferenceId,
        tokenHash,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;
    console.log(`[User Invite] ${dto.email}: ${inviteUrl}`);
    return {
      message: 'Invite sent',
      inviteUrl,
      expiresAt,
    };
  }
}
