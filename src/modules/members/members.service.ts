import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateMemberDto, scope: JwtPayload['scope']) {
    const churchId = dto.churchId ?? scope.churchId;
    if (!churchId) {
      throw new NotFoundException('churchId required when not scoped to a church');
    }
    const where = this.scope.churchWhereClause(scope);
    const churchExists = await this.prisma.church.findFirst({
      where: { ...where, id: churchId },
    });
    if (!churchExists) {
      throw new NotFoundException('Church not found or not in your scope');
    }
    const data = {
      churchId,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      status: dto.status,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      membershipDate: dto.membershipDate ? new Date(dto.membershipDate) : undefined,
    };
    return this.prisma.member.create({ data });
  }

  async findAll(scope: JwtPayload['scope']) {
    const where = this.scope.memberWhereClause(scope);
    return this.prisma.member.findMany({
      where,
      include: { church: true },
    });
  }

  async findOne(id: string, scope: JwtPayload['scope']) {
    const where = this.scope.memberWhereClause(scope);
    const member = await this.prisma.member.findFirst({
      where: { ...where, id },
      include: { church: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: string, dto: UpdateMemberDto, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    const { birthDate, membershipDate, ...rest } = dto;
    const data = {
      ...rest,
      ...(birthDate !== undefined && { birthDate: new Date(birthDate) }),
      ...(membershipDate !== undefined && { membershipDate: new Date(membershipDate) }),
    };
    return this.prisma.member.update({ where: { id }, data });
  }

  async remove(id: string, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    await this.prisma.member.delete({ where: { id } });
    return { deleted: true };
  }
}
