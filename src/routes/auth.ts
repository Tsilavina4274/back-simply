import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already used' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  return res.json({ data: { user: { id: user.id, email: user.email, name: user.name } } });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const secret = process.env.JWT_SECRET || 'change_me_to_a_secret';
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

  return res.json({ data: { token, user: { id: user.id, email: user.email, name: user.name } } });
});

export default router;
