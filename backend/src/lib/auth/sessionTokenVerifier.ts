import { jwtVerify, decodeJwt, importJWK, JWTPayload, KeyLike } from 'jose';
import { JWKS_URL } from '../../config';
import { tokenManager } from './tokenManager';
import { LRUCache } from 'lru-cache';

export interface SessionTokenPayload extends JWTPayload {
  tenantId: string;
  userId?: string;
}

const jwkCache = new LRUCache<string, KeyLike>({
  max: 1,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
});

async function getCachedPublicKey(): Promise<KeyLike> {
  const cached = jwkCache.get('jwk');
  if (cached) return cached;

  const jwt = await tokenManager.getJwtForTenant('default');

  const res = await fetch(JWKS_URL, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const jwks = await res.json();
  const key = jwks.keys?.[0];
  if (!key) throw new Error('No keys found in JWKS');

  const publicKey = await importJWK(key, 'EdDSA');
  if (!(publicKey instanceof Uint8Array)) {
    jwkCache.set('jwk', publicKey);
    return publicKey;
  }

  throw new Error('Unsupported key format received from JWKS');
}

export async function verifySessionToken(sessionToken: string): Promise<SessionTokenPayload> {
  const decoded = decodeJwt(sessionToken);
  const tenantId = typeof decoded.tenantId === 'string' ? decoded.tenantId : undefined;
  if (!tenantId) throw new Error('Token missing valid tenantId');

  const publicKey = await getCachedPublicKey();
  const { payload } = await jwtVerify(sessionToken, publicKey);

  if (typeof payload.tenantId !== 'string') {
    throw new Error('Invalid token payload: tenantId must be a string');
  }

  return payload as SessionTokenPayload;
}
