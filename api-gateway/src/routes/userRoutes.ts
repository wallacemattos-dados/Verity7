import { Router, Response } from 'express';
import { register, login } from '../controllers/UserController';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    message: 'Acesso autorizado ao perfil!',
    user: req.user
  });
});

router.get('/admin/dashboard', authenticateToken, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    message: 'Bem-vindo ao painel de administração!'
  });
});

export default router;