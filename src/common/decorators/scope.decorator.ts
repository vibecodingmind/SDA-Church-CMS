import { SetMetadata } from '@nestjs/common';

export type ScopeLevel = 'church' | 'district' | 'conference';

export const SCOPE_KEY = 'scope';

/**
 * Requires user to have at least the specified scope level.
 * church = most specific, conference = broadest.
 */
export const RequireScope = (level: ScopeLevel) =>
  SetMetadata(SCOPE_KEY, level);
