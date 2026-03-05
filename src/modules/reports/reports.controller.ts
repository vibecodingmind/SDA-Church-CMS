import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('MEMBER:VIEW')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: JwtPayload) {
    return this.reports.getDashboardStats(user.scope);
  }

  @Get('tithes')
  @RequirePermissions('TITHE:VIEW')
  tithes(
    @CurrentUser() user: JwtPayload,
    @Query('churchId') churchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.getTithesReport(user.scope, churchId, from, to);
  }
}
