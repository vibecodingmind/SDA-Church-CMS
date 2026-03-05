/**
 * Joi validation schema for environment variables.
 * All secrets and config must come from env - never hardcode in production.
 */
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required().messages({
    'string.empty': 'DATABASE_URL is required',
  }),

  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters',
  }),

  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('7d'),

  BCRYPT_ROUNDS: Joi.number().min(12).max(15).default(12),

  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(10),

  LOGIN_LOCKOUT_ATTEMPTS: Joi.number().default(5),
  LOGIN_LOCKOUT_DURATION: Joi.number().default(900), // seconds
});
