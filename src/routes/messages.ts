import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /messages?from=...&to=...
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  if (!from || !to) return res.status(400).json({ error: 'Missing from/to' });

  const msgs = await prisma.message.findMany({
    where: { OR: [ { fromId: from, toId: to }, { fromId: to, toId: from } ] },
    orderBy: { createdAt: 'asc' }
  });
  return res.json({ data: msgs });
});

// POST /messages
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { fromId, toId, content } = req.body as { fromId: string; toId: string; content: string };
  if (!fromId || !toId || !content) return res.status(400).json({ error: 'Missing fields' });
  const msg = await prisma.message.create({ data: { fromId, toId, content } });
  return res.json({ data: msg });
});

export default router;
