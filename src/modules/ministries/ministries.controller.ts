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
import { MinistriesService } from './ministries.service';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { AssignMemberDto } from './dto/assign-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('ministries')
@Controller('ministries')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('MINISTRY:VIEW')
export class MinistriesController {
  constructor(private readonly ministries: MinistriesService) {}

  @Post()
  @RequirePermissions('MINISTRY:CREATE')
  create(@Body() dto: CreateMinistryDto, @CurrentUser() user: JwtPayload) {
    return this.ministries.create(dto, user.scope);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('churchId') churchId?: string) {
    return this.ministries.findAll(user.scope, churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ministries.findOne(id, user.scope);
  }

  @Patch(':id')
  @RequirePermissions('MINISTRY:UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMinistryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ministries.update(id, dto, user.scope);
  }

  @Delete(':id')
  @RequirePermissions('MINISTRY:DELETE')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ministries.remove(id, user.scope);
  }

  @Post(':id/members')
  @RequirePermissions('MINISTRY:UPDATE')
  assignMember(
    @Param('id') id: string,
    @Body() dto: AssignMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ministries.assignMember(id, dto, user.scope);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions('MINISTRY:UPDATE')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ministries.removeMember(id, memberId, user.scope);
  }
}
