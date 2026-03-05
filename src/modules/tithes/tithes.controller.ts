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
import { TithesService } from './tithes.service';
import { CreateTitheDto } from './dto/create-tithe.dto';
import { UpdateTitheDto } from './dto/update-tithe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('tithes')
@Controller('tithes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('TITHE:VIEW')
export class TithesController {
  constructor(private readonly tithes: TithesService) {}

  @Post()
  @RequirePermissions('TITHE:CREATE')
  create(@Body() dto: CreateTitheDto, @CurrentUser() user: JwtPayload) {
    return this.tithes.create(dto, user.scope);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('churchId') churchId?: string) {
    return this.tithes.findAll(user.scope, churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tithes.findOne(id, user.scope);
  }

  @Patch(':id')
  @RequirePermissions('TITHE:UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTitheDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tithes.update(id, dto, user.scope);
  }

  @Delete(':id')
  @RequirePermissions('TITHE:DELETE')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tithes.remove(id, user.scope);
  }
}
