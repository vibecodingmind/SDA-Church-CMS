/**
 * JWT payload structure.
 * Scope embedded in token avoids DB lookup per request.
 * IMPORTANT: Invalidate tokens when user's role or scope changes.
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  roleId: string;
  permissions: string[]; // e.g. ['MEMBER:VIEW', 'MEMBER:CREATE']
  scope: {
    churchId?: string;
    districtId?: string;
    conferenceId?: string;
  };
  iat?: number; // set by jwt.sign when signing
  exp?: number; // set by jwt.sign via expiresIn
}
