import { Router, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../../middleware/auth';
import { uploadAvatar, updateDoctorProfile, getDoctorProfile } from '../../../services/doctors.service';
import { AuthRequest } from '../../../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const profile = await getDoctorProfile(req.doctor!.id);
  res.status(200).json(profile);
});

router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { full_name, email } = req.body;

  if (!full_name && !email) {
    res.status(400).json({ error: 'At least one field (full_name or email) is required' });
    return;
  }

  const updated = await updateDoctorProfile(req.doctor!.id, { full_name, email });
  res.status(200).json(updated);
});

router.post('/profile/avatar', authMiddleware, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'Avatar file is required' });
    return;
  }

  const result = await uploadAvatar(req.doctor!.id, req.file.buffer, req.file.mimetype);
  res.status(200).json(result);
});

export default router;
