import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * Example protected route: GET /members
 * Only accessible by users with MEMBER:VIEW permission.
 * Data filtered by scope automatically (church/district/conference).
 */
@ApiTags('members')
@Controller('members')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('MEMBER:VIEW')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Post()
  @RequirePermissions('MEMBER:CREATE')
  create(@Body() dto: CreateMemberDto, @CurrentUser() user: JwtPayload) {
    return this.members.create(dto, user.scope);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.members.findAll(user.scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.members.findOne(id, user.scope);
  }

  @Patch(':id')
  @RequirePermissions('MEMBER:UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.members.update(id, dto, user.scope);
  }

  @Delete(':id')
  @RequirePermissions('MEMBER:DELETE')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.members.remove(id, user.scope);
  }
}
