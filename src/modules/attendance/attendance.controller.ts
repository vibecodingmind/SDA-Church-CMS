import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('ATTENDANCE:VIEW')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post()
  @RequirePermissions('ATTENDANCE:CREATE')
  create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: JwtPayload) {
    return this.attendance.create(dto, user.scope);
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @CurrentUser() user: JwtPayload) {
    return this.attendance.findByEvent(eventId, user.scope);
  }

  @Delete('event/:eventId/member/:memberId')
  @RequirePermissions('ATTENDANCE:DELETE')
  remove(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendance.remove(eventId, memberId, user.scope);
  }
}
