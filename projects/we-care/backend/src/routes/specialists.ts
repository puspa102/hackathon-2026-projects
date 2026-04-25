import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getAvailableSpecialists } from '../services/specialists.service';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const specialty = req.query.specialty as string | undefined;

  const specialists = await getAvailableSpecialists(specialty);
  res.status(200).json(specialists);
});

export default router;
