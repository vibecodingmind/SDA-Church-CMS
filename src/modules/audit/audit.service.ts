import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

export interface AuditLogInput {
  userId: string;
  action: string;
  resource: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditQueryFilters {
  userId?: string;
  resource?: string;
  action?: string;
  from?: Date;
  to?: Date;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        resource: input.resource,
        ipAddress: input.ipAddress,
        metadata: (input.metadata ?? undefined) as object | undefined,
      },
    });
  }

  async findByUser(userId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async findByResource(resource: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { resource },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Scope-aware audit query. Returns audit logs for users within the requester's scope.
   */
  async findByScope(
    scope: JwtPayload['scope'],
    filters: AuditQueryFilters = {},
    limit = 100,
  ) {
    const userWhere = this.scope.userWhereClause(scope);
    const where: Record<string, unknown> = {};

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }
    if (filters.resource) where.resource = filters.resource;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.from || filters.to) {
      where.timestamp = {};
      if (filters.from) (where.timestamp as Record<string, Date>).gte = filters.from;
      if (filters.to) (where.timestamp as Record<string, Date>).lte = filters.to;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: { user: { select: { email: true, fullName: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
