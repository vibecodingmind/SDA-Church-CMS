import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('EVENT:VIEW')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @RequirePermissions('EVENT:CREATE')
  create(@Body() dto: CreateEventDto, @CurrentUser() user: JwtPayload) {
    return this.events.create(dto, user.scope);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('churchId') churchId?: string) {
    return this.events.findAll(user.scope, churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.events.findOne(id, user.scope);
  }

  @Patch(':id')
  @RequirePermissions('EVENT:UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.events.update(id, dto, user.scope);
  }

  @Delete(':id')
  @RequirePermissions('EVENT:DELETE')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.events.remove(id, user.scope);
  }
}
