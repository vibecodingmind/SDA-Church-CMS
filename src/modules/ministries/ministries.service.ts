import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { AssignMemberDto } from './dto/assign-member.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class MinistriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateMinistryDto, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const church = await this.prisma.church.findFirst({
      where: { ...churchWhere, id: dto.churchId },
    });
    if (!church) throw new NotFoundException('Church not found');
    return this.prisma.ministry.create({
      data: dto,
    });
  }

  async findAll(scope: JwtPayload['scope'], churchId?: string) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const where: { church: object; churchId?: string } = { church: churchWhere };
    if (churchId) where.churchId = churchId;
    return this.prisma.ministry.findMany({
      where,
      include: { _count: { select: { memberMinistries: true } } },
    });
  }

  async findOne(id: string, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const m = await this.prisma.ministry.findFirst({
      where: { id, church: churchWhere },
      include: { memberMinistries: { include: { member: true } } },
    });
    if (!m) throw new NotFoundException('Ministry not found');
    return m;
  }

  async update(id: string, dto: UpdateMinistryDto, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    return this.prisma.ministry.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    await this.prisma.ministry.delete({ where: { id } });
    return { deleted: true };
  }

  async assignMember(ministryId: string, dto: AssignMemberDto, scope: JwtPayload['scope']) {
    const ministry = await this.findOne(ministryId, scope);
    const memberWhere = this.scope.memberWhereClause(scope);
    const member = await this.prisma.member.findFirst({
      where: { ...memberWhere, id: dto.memberId, churchId: ministry.churchId },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.memberMinistry.upsert({
      where: { memberId_ministryId: { memberId: dto.memberId, ministryId } },
      create: { memberId: dto.memberId, ministryId, role: dto.role },
      update: { role: dto.role },
      include: { member: true },
    });
  }

  async removeMember(ministryId: string, memberId: string, scope: JwtPayload['scope']) {
    await this.findOne(ministryId, scope);
    await this.prisma.memberMinistry.delete({
      where: { memberId_ministryId: { memberId, ministryId } },
    });
    return { deleted: true };
  }
}
