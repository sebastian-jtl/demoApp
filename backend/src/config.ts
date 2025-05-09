import dotenv from 'dotenv';
import logger from './utils/logger';

// load .env
dotenv.config();

// server config
export const PORT = process.env.PORT || 50148;

// JTL-Plattform API-Konfiguration
export const JTL_API_URL = process.env.JTL_API_URL || 'https://api.dev.jtl-cloud.com';
export const JTL_AUTH_URL = process.env.JTL_AUTH_URL || 'https://auth.dev.jtl-cloud.com';
export const JTL_JWKS_ENDPOINT = process.env.JTL_JWKS_ENDPOINT || '/account/.well-known/jwks.json';
export const JWKS_URL = `${JTL_API_URL}${JTL_JWKS_ENDPOINT}`;

// OAuth-Credentials
export const OAUTH_TOKEN_URL = process.env.OAUTH_TOKEN_URL || 'https://auth.dev.jtl-cloud.com/oauth2/token';
export const CLIENT_ID = process.env.CLIENT_ID || '';
export const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

logger.info('Config loaded:');