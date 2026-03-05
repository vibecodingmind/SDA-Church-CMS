import { Module, Global } from '@nestjs/common';
import { ScopeService } from './services/scope.service';

@Global()
@Module({
  providers: [ScopeService],
  exports: [ScopeService],
})
export class CommonModule {}
