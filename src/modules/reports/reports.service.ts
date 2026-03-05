import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async getDashboardStats(scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const [membersCount, churchesCount, eventsCount, tithesSum] = await Promise.all([
      this.prisma.member.count({ where: { church: churchWhere } }),
      this.prisma.church.count({ where: churchWhere }),
      this.prisma.churchEvent.count({ where: { church: churchWhere } }),
      this.prisma.tithe.aggregate({
        where: { church: churchWhere },
        _sum: { amount: true },
      }),
    ]);
    return {
      membersCount,
      churchesCount,
      eventsCount,
      tithesTotal: tithesSum._sum.amount ? Number(tithesSum._sum.amount) : 0,
    };
  }

  async getTithesReport(scope: JwtPayload['scope'], churchId?: string, from?: string, to?: string) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const where: Prisma.TitheWhereInput = { church: churchWhere };
    if (churchId) where.churchId = churchId;
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }
    const [items, sum] = await Promise.all([
      this.prisma.tithe.findMany({
        where,
        include: { member: true },
        orderBy: { recordedAt: 'desc' },
        take: 100,
      }),
      this.prisma.tithe.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);
    return {
      items,
      totalAmount: sum._sum.amount ? Number(sum._sum.amount) : 0,
      count: sum._count,
    };
  }
}
