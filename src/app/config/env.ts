import dotenv from 'dotenv';
dotenv.config();
interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  REDIS_URL: string;
  ALLOWED_ORIGINS?: string;
}
