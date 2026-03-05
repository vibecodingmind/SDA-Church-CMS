import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

export const SCOPE_CONTEXT_KEY = 'scope';

/**
 * Injects user's scope into request for downstream services to filter data.
 * Used by ScopeService to build Prisma where clauses.
 */
@Injectable()
export class ScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    const scope = user && 'scope' in user ? (user as JwtPayload).scope : undefined;
    if (scope) {
      (request as Record<string, unknown>)[SCOPE_CONTEXT_KEY] = scope;
    }
    return next.handle();
  }
}
