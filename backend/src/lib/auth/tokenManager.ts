import { CLIENT_ID, CLIENT_SECRET, JTL_AUTH_URL } from '../../config';
import { ClientCredentials, ModuleOptions, AccessToken } from 'simple-oauth2';
import { LRUCache } from 'lru-cache';
import logger from '../../utils/logger';

interface CachedToken {
  token: AccessToken;
}

class TokenManager {
  private tokenCache: LRUCache<string, CachedToken>;

  constructor() {
    this.tokenCache = new LRUCache<string, CachedToken>({
      max: 100,
      ttlAutopurge: true,
    });
  }

  private createOAuthClient(): ClientCredentials {
    const config: ModuleOptions = {
      client: {
        id: CLIENT_ID,
        secret: CLIENT_SECRET,
      },
      auth: {
        tokenHost: JTL_AUTH_URL,
        tokenPath: '/oauth2/token',
      }
    };
    return new ClientCredentials(config);
  }

  async getJwtForTenant(tenantId: string): Promise<string> {
    const cached = this.tokenCache.get(tenantId);
    if (cached && cached.token.expired() === false) {
      return cached.token.token.access_token as string;
    }

    return await this.fetchNewToken(tenantId);
  }

  private async fetchNewToken(tenantId: string): Promise<string> {
    const client = this.createOAuthClient();
  
    try {
      const token = await client.getToken({ scope: '' });
  
      let rawExpiresIn = token.token.expires_in ?? '3600';
      const expiresIn =
        typeof rawExpiresIn === 'string' ? parseInt(rawExpiresIn, 10) : rawExpiresIn as number;
  
      if (isNaN(expiresIn) || expiresIn <= 0) {
        throw new Error(`Invalid expires_in value returned from token endpoint: ${rawExpiresIn}`);
      }
  
      const bufferSeconds = 5 * 60;
      const ttl = Math.max(expiresIn - bufferSeconds, 0) * 1000;
  
      this.tokenCache.set(tenantId, { token }, { ttl });
  
      return token.token.access_token as string;
    } catch (err: any) {
      logger.error(`Token request failed for tenant ${tenantId}`);
      if (err.response) {
        logger.error(`Status: ${err.response.status}`);
        logger.error(`Data: ${JSON.stringify(err.response.data)}`);
      } else {
        logger.error(`Error: ${err.message}`);
      }
      throw err;
    }
  }
  
  handleApiError(tenantId: string, statusCode: number): void {
    if (statusCode === 401) {
      this.tokenCache.delete(tenantId);
    }
  }
}

export const tokenManager = new TokenManager();
