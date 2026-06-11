import { Router, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateToken } from '../middlewares/authMiddleware';
import { listCaptures, getCapture } from '../controllers/CaptureController';

const router = Router();
const captureServiceUrl = process.env.CAPTURE_SERVICE_URL;

if (!captureServiceUrl) {
  throw new Error('CAPTURE_SERVICE_URL não configurado no ficheiro .env');
}

// GET /api/captures — lista registros do usuário autenticado (Desvio 1)
router.get('/captures', authenticateToken, listCaptures);

// GET /api/captures/:id — detalhe de um registro (Desvio 1)
router.get('/captures/:id', authenticateToken, getCapture);

router.use(
  '/capture', 
  authenticateToken, 
  createProxyMiddleware({
    target: captureServiceUrl,
    changeOrigin: true,
    proxyTimeout: 65000,
    timeout: 65000,
    pathRewrite: {
      '^/': '/api/capture', 
    },
    on: {
      proxyReq: (proxyReq, req: any, res) => {
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.id);
          proxyReq.setHeader('x-user-role', req.user.role);
        }
        // express.json() já consumiu o stream — precisa reescrever o body
        if (req.body && Object.keys(req.body).length > 0) {
          const body = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
          proxyReq.write(body);
        }
      },

      error: (err, req, res) => {
        console.error('[Gateway] Falha na comunicação com o Serviço de Captura:', err.message);
        const expressRes = res as Response;
        
        expressRes.status(502).json({
          error: "Bad Gateway",
          message: "O serviço de captura de provas está temporariamente indisponível. Por favor, tente novamente em alguns instantes."
        });
      }
    }
  })
);

export default router;