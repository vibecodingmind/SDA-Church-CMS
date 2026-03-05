import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * E2E tests for Auth flow.
 * Requires DATABASE_URL pointing to a test database with migrations applied.
 * Run: DATABASE_URL=postgresql://... npm run test:e2e
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
        .expect(401);
    });

    it('should reject invalid payload', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('should return tokens for valid credentials', async () => {
      const role = await prisma.role.findFirst();
      const conference = await prisma.conference.findFirst();
      const district = await prisma.district.findFirst();
      const church = await prisma.church.findFirst();

      if (!role || !conference || !district || !church) {
        console.warn('Skipping login e2e: seed data not found. Run prisma db seed.');
        return;
      }

      const passwordHash = await bcrypt.hash('TestPass123!', 12);
      const user = await prisma.user.upsert({
        where: { email: 'e2etest@example.com' },
        create: {
          fullName: 'E2E Test',
          email: 'e2etest@example.com',
          passwordHash,
          roleId: role.id,
          churchId: church.id,
          districtId: district.id,
          conferenceId: conference.id,
        },
        update: { passwordHash },
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2etest@example.com', password: 'TestPass123!' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe('e2etest@example.com');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('GET /health', () => {
    it('should return 200', () => {
      return request(app.getHttpServer()).get('/health').expect(200);
    });
  });
});
