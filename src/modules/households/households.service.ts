import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateHouseholdDto, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const church = await this.prisma.church.findFirst({
      where: { ...churchWhere, id: dto.churchId },
    });
    if (!church) throw new NotFoundException('Church not found');
    return this.prisma.household.create({
      data: dto,
    });
  }

  async findAll(scope: JwtPayload['scope'], churchId?: string) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const where: { church: object; churchId?: string } = { church: churchWhere };
    if (churchId) where.churchId = churchId;
    return this.prisma.household.findMany({
      where,
      include: { _count: { select: { members: true } } },
    });
  }

  async findOne(id: string, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const h = await this.prisma.household.findFirst({
      where: { id, church: churchWhere },
      include: { members: true },
    });
    if (!h) throw new NotFoundException('Household not found');
    return h;
  }

  async update(id: string, dto: UpdateHouseholdDto, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    return this.prisma.household.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    await this.prisma.member.updateMany({
      where: { householdId: id },
      data: { householdId: null },
    });
    await this.prisma.household.delete({ where: { id } });
    return { deleted: true };
  }
}
