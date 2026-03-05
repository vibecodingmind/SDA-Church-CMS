import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async create(dto: CreateAttendanceDto, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const event = await this.prisma.churchEvent.findFirst({
      where: { id: dto.eventId, church: churchWhere },
    });
    if (!event) throw new NotFoundException('Event not found');
    const memberWhere = this.scope.memberWhereClause(scope);
    const member = await this.prisma.member.findFirst({
      where: { ...memberWhere, id: dto.memberId, churchId: event.churchId },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.attendance.upsert({
      where: { eventId_memberId: { eventId: dto.eventId, memberId: dto.memberId } },
      create: { eventId: dto.eventId, memberId: dto.memberId, notes: dto.notes },
      update: { notes: dto.notes },
      include: { member: true },
    });
  }

  async findByEvent(eventId: string, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const event = await this.prisma.churchEvent.findFirst({
      where: { id: eventId, church: churchWhere },
      include: { attendances: { include: { member: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event.attendances;
  }

  async remove(eventId: string, memberId: string, scope: JwtPayload['scope']) {
    const churchWhere = this.scope.churchWhereClause(scope);
    const a = await this.prisma.attendance.findFirst({
      where: { eventId, memberId, event: { church: churchWhere } },
    });
    if (!a) throw new NotFoundException('Attendance not found');
    await this.prisma.attendance.delete({
      where: { eventId_memberId: { eventId, memberId } },
    });
    return { deleted: true };
  }
}
