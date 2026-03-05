import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateTitheDto } from './dto/create-tithe.dto';
import { UpdateTitheDto } from './dto/update-tithe.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class TithesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateTitheDto, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const church = await this.prisma.church.findFirst({
      where: { ...churchWhere, id: dto.churchId },
    });
    if (!church) throw new NotFoundException('Church not found');
    const memberWhere = this.scope.memberWhereClause(scope);
    const member = await this.prisma.member.findFirst({
      where: { ...memberWhere, id: dto.memberId, churchId: dto.churchId },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.tithe.create({
      data: {
        memberId: dto.memberId,
        churchId: dto.churchId,
        amount: new Prisma.Decimal(dto.amount),
        category: dto.category,
        notes: dto.notes,
      },
      include: { member: true },
    });
  }

  async findAll(scope: JwtPayload['scope'], churchId?: string) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const where: Prisma.TitheWhereInput = { church: churchWhere };
    if (churchId) where.churchId = churchId;
    return this.prisma.tithe.findMany({
      where,
      include: { member: true },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findOne(id: string, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const t = await this.prisma.tithe.findFirst({
      where: { id, church: churchWhere },
      include: { member: true },
    });
    if (!t) throw new NotFoundException('Tithe not found');
    return t;
  }

  async update(id: string, dto: UpdateTitheDto, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    const data: Prisma.TitheUpdateInput = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return this.prisma.tithe.update({
      where: { id },
      data,
      include: { member: true },
    });
  }

  async remove(id: string, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    await this.prisma.tithe.delete({ where: { id } });
    return { deleted: true };
  }
}
