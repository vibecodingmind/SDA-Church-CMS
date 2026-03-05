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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('USER:VIEW')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @RequirePermissions('USER:CREATE')
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Post('invite')
  @RequirePermissions('USER:CREATE')
  createInvite(@Body() dto: CreateInviteDto, @CurrentUser() user: JwtPayload) {
    return this.users.createInvite(dto, user.scope);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.users.findAll(user.scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.users.findOne(id, user.scope);
  }

  @Patch(':id')
  @RequirePermissions('USER:UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.users.update(id, dto, user.scope);
  }

  @Delete(':id')
  @RequirePermissions('USER:DELETE')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.users.remove(id, user.scope);
  }
}
