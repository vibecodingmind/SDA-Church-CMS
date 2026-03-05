import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateEventDto, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const church = await this.prisma.church.findFirst({
      where: { ...churchWhere, id: dto.churchId },
    });
    if (!church) throw new NotFoundException('Church not found');
    return this.prisma.churchEvent.create({
      data: {
        churchId: dto.churchId,
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        eventType: dto.eventType,
      },
    });
  }

  async findAll(scope: JwtPayload['scope'], churchId?: string) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const where: { church: object; churchId?: string } = { church: churchWhere };
    if (churchId) where.churchId = churchId;
    return this.prisma.churchEvent.findMany({
      where,
      include: { _count: { select: { attendances: true } } },
      orderBy: { eventDate: 'desc' },
    });
  }

  async findOne(id: string, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const e = await this.prisma.churchEvent.findFirst({
      where: { id, church: churchWhere },
      include: { attendances: { include: { member: true } } },
    });
    if (!e) throw new NotFoundException('Event not found');
    return e;
  }

  async update(id: string, dto: UpdateEventDto, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.eventDate !== undefined) data.eventDate = new Date(dto.eventDate);
    if (dto.eventType !== undefined) data.eventType = dto.eventType;
    return this.prisma.churchEvent.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, scope: JwtPayload['scope']) {
    await this.findOne(id, scope);
    await this.prisma.churchEvent.delete({ where: { id } });
    return { deleted: true };
  }
}
