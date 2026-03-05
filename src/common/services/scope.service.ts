import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

/**
 * Builds Prisma where clauses for scope-based data filtering.
 * Church scope: most specific (single church)
 * District scope: all churches in district
 * Conference scope: all churches in conference
 */
@Injectable()
export class ScopeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Filter members by user's scope.
   * Use when querying Member model.
   */
  memberWhereClause(scope: JwtPayload['scope']): Prisma.MemberWhereInput {
    if (scope.churchId) {
      return { churchId: scope.churchId };
    }
    if (scope.districtId) {
      return { church: { districtId: scope.districtId } };
    }
    if (scope.conferenceId) {
      return { church: { district: { conferenceId: scope.conferenceId } } };
    }
    return {}; // No scope = no access (or throw)
  }

  /**
   * Filter districts by user's scope.
   * For church scope: only the district containing that church.
   */
  districtWhereClause(scope: JwtPayload['scope']): Prisma.DistrictWhereInput {
    if (scope.churchId) {
      return { churches: { some: { id: scope.churchId } } };
    }
    if (scope.districtId) {
      return { id: scope.districtId };
    }
    if (scope.conferenceId) {
      return { conferenceId: scope.conferenceId };
    }
    return {};
  }

  /**
   * Filter churches by user's scope.
   */
  churchWhereClause(scope: JwtPayload['scope']): Prisma.ChurchWhereInput {
    if (scope.churchId) {
      return { id: scope.churchId };
    }
    if (scope.districtId) {
      return { districtId: scope.districtId };
    }
    if (scope.conferenceId) {
      return { district: { conferenceId: scope.conferenceId } };
    }
    return {};
  }

  /**
   * Filter users by user's scope.
   */
  userWhereClause(scope: JwtPayload['scope']): Prisma.UserWhereInput {
    if (scope.churchId) {
      return { churchId: scope.churchId };
    }
    if (scope.districtId) {
      return { districtId: scope.districtId };
    }
    if (scope.conferenceId) {
      return { conferenceId: scope.conferenceId };
    }
    return {};
  }

  /**
   * Check if user has any scope assigned.
   */
  hasScope(scope: JwtPayload['scope']): boolean {
    return !!(scope.churchId || scope.districtId || scope.conferenceId);
  }
}
