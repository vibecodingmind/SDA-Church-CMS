import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('AUDIT:VIEW')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('scope')
  @ApiOperation({ summary: 'Scope-aware audit logs' })
  findByScope(
    @CurrentUser() user: JwtPayload,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.findByScope(
      user.scope,
      {
        resource,
        action,
        userId,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      },
      limit ? parseInt(limit, 10) : 100,
    );
  }

  @Get('resource')
  findByResource(
    @Query('resource') resource: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.findByResource(
      resource,
      limit ? parseInt(limit, 10) : 100,
    );
  }

  @Get()
  findByUser(@Query('userId') userId: string, @Query('limit') limit?: string) {
    return this.audit.findByUser(userId, limit ? parseInt(limit, 10) : 100);
  }
}
