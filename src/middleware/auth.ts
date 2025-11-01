import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

export function requireAuth(req: Request & { user?: { id: string } }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });

  const token = auth.replace('Bearer ', '');
  try {
    const secret = process.env.JWT_SECRET || 'change_me_to_a_secret';
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
