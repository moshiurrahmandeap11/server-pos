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
    WEBDOMAIN?: string;
}

const loadEnvVariables = (): EnvConfig => {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '5000',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pos_db?schema=public',
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'pos_access_token_secret_2026_super_key',
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'pos_refresh_token_secret_2026_super_key',
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001',
        WEBDOMAIN: process.env.WEBDOMAIN,
    };
};

export const env = loadEnvVariables();
