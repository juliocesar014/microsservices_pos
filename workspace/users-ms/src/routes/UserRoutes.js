import { Router } from 'express';
import { UserController } from '../controller/UserController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Rota de login
router.post('/login', UserController.login);

// Rota não protegida
router.get('/users/:username', UserController.findUserByName);
router.post('/users', UserController.save);

// Rotas protegidas
router.use(authMiddleware);

router.get('/users', UserController.findAll);


export default router;
