import express from 'express';
import { proxyErpRequest } from '../lib/wawiClient';

const router = express.Router();

router.use('*', (req, res) => {
  const strippedUrl = req.originalUrl.replace(/^\/api/, '') || '/';
  proxyErpRequest(req, res, strippedUrl);
});

export default router;
