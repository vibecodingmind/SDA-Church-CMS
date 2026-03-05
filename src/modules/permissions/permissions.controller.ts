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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('PERMISSION:VIEW')
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) {}

  @Post()
  @RequirePermissions('PERMISSION:CREATE')
  create(@Body() dto: CreatePermissionDto) {
    return this.permissions.create(dto);
  }

  @Get()
  findAll() {
    return this.permissions.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissions.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('PERMISSION:UPDATE')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissions.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('PERMISSION:DELETE')
  remove(@Param('id') id: string) {
    return this.permissions.remove(id);
  }
}
