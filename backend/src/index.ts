import express from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { PORT } from './config';
import erpRoutes from './routes/erp';
import tenantRoutes from './routes/tenant';

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:51044', // Frontend in der Entwicklung
    'http://localhost:5173',  // Vite Standard-Port
    'http://localhost:4173'   // Vite Preview-Port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use(`/api/erp`, erpRoutes);
app.use(`/api/tenant`, tenantRoutes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 404 handler
app.use((_req, res) => {
  logger.warn(`404: ${_req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled server error', err);
  res.status(500).json({
    error: 'Oops',
    message: err.message || 'Noone expected this!'
  });
});

// gogogo
app.listen(PORT, () => {
  logger.info(`⚡️ Server running on http://localhost:${PORT}`);
}); 