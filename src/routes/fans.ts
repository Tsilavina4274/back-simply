import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /fans
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const fans = await prisma.fan.findMany();
  return res.json({ data: fans });
});

// POST /fans
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { nom, initiale, urlAvatar, statut, derniereActivite, totalDepense } = req.body;
  const fan = await prisma.fan.create({ data: { nom, initiale, urlAvatar, statut, derniereActivite: derniereActivite ? new Date(derniereActivite) : undefined, totalDepense } });
  return res.json({ data: fan });
});

export default router;
