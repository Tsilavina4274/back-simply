import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /images
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const images = await prisma.image.findMany();
  return res.json({ data: images });
});

// POST /images
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { url, price, versionTag, versionColor } = req.body;
  const image = await prisma.image.create({ data: { url, price, versionTag, versionColor } });
  return res.json({ data: image });
});

export default router;
