import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const captureServiceUrl = process.env.CAPTURE_SERVICE_URL;

if (!captureServiceUrl) {
  throw new Error('CAPTURE_SERVICE_URL não configurado no ficheiro .env');
}

router.use(
  '/capture', 
  authenticateToken, 
  createProxyMiddleware({
    target: captureServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/api/capture', 
    },
    on: {
      proxyReq: (proxyReq, req: any, res) => {
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.id);
          proxyReq.setHeader('x-user-role', req.user.role);
        }
      }
    }
  })
);

export default router;