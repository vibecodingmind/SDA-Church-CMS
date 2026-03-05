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
import { OrganizationService } from './organization.service';
import { CreateConferenceDto } from './dto/create-conference.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { CreateChurchDto } from './dto/create-church.dto';
import {
  UpdateConferenceDto,
  UpdateDistrictDto,
  UpdateChurchDto,
} from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('organization')
@Controller('organization')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('ORGANIZATION:VIEW')
export class OrganizationController {
  constructor(private readonly org: OrganizationService) {}

  @Post('conferences')
  @RequirePermissions('ORGANIZATION:CREATE')
  createConference(@Body() dto: CreateConferenceDto) {
    return this.org.createConference(dto);
  }

  @Post('districts')
  @RequirePermissions('ORGANIZATION:CREATE')
  createDistrict(@Body() dto: CreateDistrictDto) {
    return this.org.createDistrict(dto);
  }

  @Post('churches')
  @RequirePermissions('ORGANIZATION:CREATE')
  createChurch(@Body() dto: CreateChurchDto) {
    return this.org.createChurch(dto);
  }

  @Get('conferences')
  findAllConferences() {
    return this.org.findAllConferences();
  }

  @Get('districts')
  findAllDistricts(@CurrentUser() user: JwtPayload) {
    return this.org.findAllDistricts(user.scope);
  }

  @Get('churches')
  findAllChurches(@CurrentUser() user: JwtPayload) {
    return this.org.findAllChurches(user.scope);
  }

  @Get('conferences/:id')
  findConference(@Param('id') id: string) {
    return this.org.findConference(id);
  }

  @Get('districts/:id')
  findDistrict(@Param('id') id: string) {
    return this.org.findDistrict(id);
  }

  @Get('churches/:id')
  findChurch(@Param('id') id: string) {
    return this.org.findChurch(id);
  }

  @Patch('conferences/:id')
  @RequirePermissions('ORGANIZATION:UPDATE')
  updateConference(@Param('id') id: string, @Body() dto: UpdateConferenceDto) {
    return this.org.updateConference(id, dto);
  }

  @Patch('districts/:id')
  @RequirePermissions('ORGANIZATION:UPDATE')
  updateDistrict(@Param('id') id: string, @Body() dto: UpdateDistrictDto) {
    return this.org.updateDistrict(id, dto);
  }

  @Patch('churches/:id')
  @RequirePermissions('ORGANIZATION:UPDATE')
  updateChurch(@Param('id') id: string, @Body() dto: UpdateChurchDto) {
    return this.org.updateChurch(id, dto);
  }

  @Delete('conferences/:id')
  @RequirePermissions('ORGANIZATION:DELETE')
  deleteConference(@Param('id') id: string) {
    return this.org.deleteConference(id);
  }

  @Delete('districts/:id')
  @RequirePermissions('ORGANIZATION:DELETE')
  deleteDistrict(@Param('id') id: string) {
    return this.org.deleteDistrict(id);
  }

  @Delete('churches/:id')
  @RequirePermissions('ORGANIZATION:DELETE')
  deleteChurch(@Param('id') id: string) {
    return this.org.deleteChurch(id);
  }
}
