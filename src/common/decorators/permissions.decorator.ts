import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Requires one or more permissions. User must have at least one.
 * Permissions are loaded from DB and embedded in JWT at login - no hardcoding.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
