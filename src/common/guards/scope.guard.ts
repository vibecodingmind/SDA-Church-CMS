import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPE_KEY, ScopeLevel } from '../decorators/scope.decorator';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

const SCOPE_ORDER: Record<ScopeLevel, number> = {
  church: 1,
  district: 2,
  conference: 3,
};

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScope = this.reflector.getAllAndOverride<ScopeLevel>(
      SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScope) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!user?.scope) {
      throw new ForbiddenException('User has no scope assignment');
    }

    const userScopeLevel = this.getUserScopeLevel(user.scope);
    const requiredLevel = SCOPE_ORDER[requiredScope];

    if (userScopeLevel === 0) {
      throw new ForbiddenException('User must be assigned to a church, district, or conference');
    }

    if (userScopeLevel > requiredLevel) {
      throw new ForbiddenException(
        `This action requires ${requiredScope}-level scope or higher`,
      );
    }

    return true;
  }

  private getUserScopeLevel(scope: JwtPayload['scope']): number {
    if (scope.churchId) return SCOPE_ORDER.church;
    if (scope.districtId) return SCOPE_ORDER.district;
    if (scope.conferenceId) return SCOPE_ORDER.conference;
    return 0;
  }
}
