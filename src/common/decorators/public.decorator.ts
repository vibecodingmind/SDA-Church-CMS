import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public - skips JWT authentication.
 * Use for login, refresh, health check, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
