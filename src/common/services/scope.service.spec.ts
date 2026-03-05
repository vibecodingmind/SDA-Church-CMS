import { Test, TestingModule } from '@nestjs/testing';
import { ScopeService } from './scope.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

describe('ScopeService', () => {
  let service: ScopeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScopeService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ScopeService>(ScopeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('memberWhereClause', () => {
    it('should return churchId filter when church scope', () => {
      const scope: JwtPayload['scope'] = { churchId: 'church-1' };
      expect(service.memberWhereClause(scope)).toEqual({ churchId: 'church-1' });
    });

    it('should return district filter when district scope', () => {
      const scope: JwtPayload['scope'] = { districtId: 'district-1' };
      expect(service.memberWhereClause(scope)).toEqual({
        church: { districtId: 'district-1' },
      });
    });

    it('should return conference filter when conference scope', () => {
      const scope: JwtPayload['scope'] = { conferenceId: 'conf-1' };
      expect(service.memberWhereClause(scope)).toEqual({
        church: { district: { conferenceId: 'conf-1' } },
      });
    });

    it('should return empty object when no scope', () => {
      expect(service.memberWhereClause({})).toEqual({});
    });
  });

  describe('churchWhereClause', () => {
    it('should return church id when church scope', () => {
      const scope: JwtPayload['scope'] = { churchId: 'church-1' };
      expect(service.churchWhereClause(scope)).toEqual({ id: 'church-1' });
    });

    it('should return districtId when district scope', () => {
      const scope: JwtPayload['scope'] = { districtId: 'district-1' };
      expect(service.churchWhereClause(scope)).toEqual({
        districtId: 'district-1',
      });
    });

    it('should return conference filter when conference scope', () => {
      const scope: JwtPayload['scope'] = { conferenceId: 'conf-1' };
      expect(service.churchWhereClause(scope)).toEqual({
        district: { conferenceId: 'conf-1' },
      });
    });
  });

  describe('userWhereClause', () => {
    it('should return churchId when church scope', () => {
      const scope: JwtPayload['scope'] = { churchId: 'church-1' };
      expect(service.userWhereClause(scope)).toEqual({ churchId: 'church-1' });
    });

    it('should return districtId when district scope', () => {
      const scope: JwtPayload['scope'] = { districtId: 'district-1' };
      expect(service.userWhereClause(scope)).toEqual({
        districtId: 'district-1',
      });
    });
  });

  describe('hasScope', () => {
    it('should return true when churchId present', () => {
      expect(service.hasScope({ churchId: 'c1' })).toBe(true);
    });

    it('should return true when districtId present', () => {
      expect(service.hasScope({ districtId: 'd1' })).toBe(true);
    });

    it('should return true when conferenceId present', () => {
      expect(service.hasScope({ conferenceId: 'c1' })).toBe(true);
    });

    it('should return false when empty scope', () => {
      expect(service.hasScope({})).toBe(false);
    });
  });
});
