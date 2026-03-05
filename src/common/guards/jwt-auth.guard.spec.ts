import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const ctx = {
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { sub: '123', email: 'test@test.com' };
      expect(guard.handleRequest(null, user)).toBe(user);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, false)).toThrow(
        UnauthorizedException,
      );
    });

    it('should rethrow error when err provided', () => {
      const err = new Error('Token expired');
      expect(() => guard.handleRequest(err, {})).toThrow('Token expired');
    });
  });
});
