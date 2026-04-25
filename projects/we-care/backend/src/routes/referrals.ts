import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createPatientAndReferral,
  getReferralsByDoctor,
  getReferralById,
  updateReferralStatus,
} from '../services/referrals.service';
import { AuthRequest } from '../types';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { patient, referral } = req.body;

  if (!patient?.full_name || !referral?.specialist_id || !referral?.clinical_notes) {
    res.status(400).json({ error: 'patient.full_name, referral.specialist_id and referral.clinical_notes are required' });
    return;
  }

  const result = await createPatientAndReferral(req.doctor!.id, patient, referral);
  res.status(201).json(result);
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const referrals = await getReferralsByDoctor(req.doctor!.id);
  res.status(200).json(referrals);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const referral = await getReferralById(req.params.id, req.doctor!.id);
  res.status(200).json(referral);
});

router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const allowed = ['pending', 'sent', 'accepted', 'completed'];

  if (!status || !allowed.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    return;
  }

  const updated = await updateReferralStatus(req.params.id, req.doctor!.id, status);
  res.status(200).json(updated);
});

export default router;
