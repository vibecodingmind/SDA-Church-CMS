import { Module } from '@nestjs/common';
import { TithesController } from './tithes.controller';
import { TithesService } from './tithes.service';

@Module({
  controllers: [TithesController],
  providers: [TithesService],
  exports: [TithesService],
})
export class TithesModule {}
