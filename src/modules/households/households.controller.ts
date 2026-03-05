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
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('households')
@Controller('households')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('HOUSEHOLD:VIEW')
export class HouseholdsController {
  constructor(private readonly households: HouseholdsService) {}

  @Post()
  @RequirePermissions('HOUSEHOLD:CREATE')
  create(@Body() dto: CreateHouseholdDto, @CurrentUser() user: JwtPayload) {
    return this.households.create(dto, user.scope);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('churchId') churchId?: string) {
    return this.households.findAll(user.scope, churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.households.findOne(id, user.scope);
  }

  @Patch(':id')
  @RequirePermissions('HOUSEHOLD:UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHouseholdDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.households.update(id, dto, user.scope);
  }

  @Delete(':id')
  @RequirePermissions('HOUSEHOLD:DELETE')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.households.remove(id, user.scope);
  }
}
