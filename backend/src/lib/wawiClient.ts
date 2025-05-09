import express from 'express';
import axios from 'axios';
import { verifySessionToken } from './auth/sessionTokenVerifier';
import { tokenManager } from './auth/tokenManager';
import { JTL_API_URL } from '../config';

function extractBearerToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim() || null
    : null;
}

async function proxyErpRequest(req: express.Request, res: express.Response, path: string) {
  const sessionToken = extractBearerToken(req);
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token missing' });
  }

  try {
    const { tenantId } = await verifySessionToken(sessionToken);
    if (!tenantId) {
      return res.status(400).json({ error: 'No tenant ID in token' });
    }

    return await forwardErpRequest(req, res, path, tenantId);
  } catch (err) {
    return res.status(500).json({
      error: 'ERP request failed',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

async function forwardErpRequest(
  req: express.Request,
  res: express.Response,
  path: string,
  tenantId: string
) {
  try {
    const accessToken = await tokenManager.getJwtForTenant(tenantId);
    const apiUrl = `${JTL_API_URL}${path}`;

    const response = await axios({
      url: apiUrl,
      method: req.method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-AppVersion': '1'
      },
      params: req.query,
      data: req.method !== 'GET' ? req.body : undefined,
      validateStatus: () => true,
      timeout: 10000
    });

    if (response.status >= 400) {
      tokenManager.handleApiError(tenantId, response.status);
      return res.status(response.status).json({
        error: 'ERP API request failed',
        message: response.data?.message || 'Unknown error',
        status: response.status,
        details: response.data
      });
    }

    const contentType = response.headers['content-type'] || 'application/json';
    const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    return res.status(response.status).type(contentType).send(body);
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status || 500 : 500;
    const message = axios.isAxiosError(err)
      ? err.message
      : 'Unknown error';

    return res.status(status).json({ error: 'Request failed', message });
  }
}

export { proxyErpRequest };
