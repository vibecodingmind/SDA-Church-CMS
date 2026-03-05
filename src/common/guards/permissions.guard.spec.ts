import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const createMockContext = (user: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('should allow when no permissions required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext({ permissions: [] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user has required permission', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['MEMBER:VIEW']);
    const ctx = createMockContext({
      permissions: ['MEMBER:VIEW', 'MEMBER:CREATE'],
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user has one of multiple required permissions', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['MEMBER:VIEW', 'ADMIN:ALL']);
    const ctx = createMockContext({ permissions: ['MEMBER:VIEW'] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks permission', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['ADMIN:ALL']);
    const ctx = createMockContext({ permissions: ['MEMBER:VIEW'] });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no permissions', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['MEMBER:VIEW']);
    const ctx = createMockContext({});
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
