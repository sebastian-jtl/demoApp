import express, { Request, Response } from 'express';
import { verifySessionToken } from '../lib/auth/sessionTokenVerifier';

const router = express.Router();

interface ConnectRequestBody {
  sessionToken: string;
}

router.post('/connect', async (req: Request<unknown, unknown, ConnectRequestBody>, res: Response) => {
  const { sessionToken } = req.body;

  if (!sessionToken) {
    return res.status(400).json({
      error: 'Missing session token',
    });
  }

  try {
    const jwt = await verifySessionToken(sessionToken);

    if (!jwt.tenantId) {
      return res.status(400).json({
        error: 'Token is valid but tenantId is missing',
      });
    }

    return res.status(200).json({
      success: true,
      tenantId: jwt.tenantId,
      message: `Tenant connected: ${jwt.tenantId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      error: 'Error connecting tenant',
      message,
    });
  }
});

export default router;
