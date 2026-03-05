import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeService } from '../../common/services/scope.service';
import { CreateConferenceDto } from './dto/create-conference.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { CreateChurchDto } from './dto/create-church.dto';
import {
  UpdateConferenceDto,
  UpdateDistrictDto,
  UpdateChurchDto,
} from './dto/update-organization.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async createConference(dto: CreateConferenceDto) {
    return this.prisma.conference.create({ data: dto });
  }

  async createDistrict(dto: CreateDistrictDto) {
    return this.prisma.district.create({ data: dto });
  }

  async createChurch(dto: CreateChurchDto) {
    return this.prisma.church.create({ data: dto });
  }

  async findAllConferences() {
    return this.prisma.conference.findMany({
      include: {
        districts: {
          include: { churches: true },
        },
      },
    });
  }

  async findAllDistricts(scope?: JwtPayload['scope']) {
    const where = scope ? this.scope.districtWhereClause(scope) : {};
    return this.prisma.district.findMany({
      where,
      include: { conference: true, churches: true },
    });
  }

  async findAllChurches(scope?: JwtPayload['scope']) {
    const where = scope ? this.scope.churchWhereClause(scope) : {};
    return this.prisma.church.findMany({
      where,
      include: { district: { include: { conference: true } } },
    });
  }

  async findConference(id: string) {
    const c = await this.prisma.conference.findUnique({
      where: { id },
      include: { districts: { include: { churches: true } } },
    });
    if (!c) throw new NotFoundException('Conference not found');
    return c;
  }

  async findDistrict(id: string) {
    const d = await this.prisma.district.findUnique({
      where: { id },
      include: { conference: true, churches: true },
    });
    if (!d) throw new NotFoundException('District not found');
    return d;
  }

  async findChurch(id: string) {
    const c = await this.prisma.church.findUnique({
      where: { id },
      include: { district: { include: { conference: true } } },
    });
    if (!c) throw new NotFoundException('Church not found');
    return c;
  }

  async updateConference(id: string, dto: UpdateConferenceDto) {
    await this.findConference(id);
    return this.prisma.conference.update({ where: { id }, data: dto });
  }

  async updateDistrict(id: string, dto: UpdateDistrictDto) {
    await this.findDistrict(id);
    return this.prisma.district.update({ where: { id }, data: dto });
  }

  async updateChurch(id: string, dto: UpdateChurchDto) {
    await this.findChurch(id);
    return this.prisma.church.update({ where: { id }, data: dto });
  }

  async deleteConference(id: string) {
    await this.findConference(id);
    await this.prisma.conference.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteDistrict(id: string) {
    await this.findDistrict(id);
    await this.prisma.district.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteChurch(id: string) {
    await this.findChurch(id);
    await this.prisma.church.delete({ where: { id } });
    return { deleted: true };
  }
}
