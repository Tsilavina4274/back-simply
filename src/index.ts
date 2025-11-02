import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './prisma';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import fansRoutes from './routes/fans';
import imagesRoutes from './routes/images';
import contenuRoutes from './routes/contenu';
import messagesRoutes from './routes/messages';

dotenv.config();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    const app = express();

    // ====================================================
    // 🧩 Configuration CORS multi-origine propre
    // ====================================================
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://simply-three.vercel.app';
    const allowedOrigins = FRONTEND_URL.split(',').map(o => o.trim());

    app.use(cors({
      origin: process.env.FRONTEND_URL?.split(',') || [
        'http://localhost:5173',
        'http://localhost:8080',
        'https://simply-three.vercel.app'
      ],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'], // ✅ essentiel
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }));

    console.log('✅ CORS configuré pour :', allowedOrigins.join(', '));

    // ====================================================
    // Middlewares & Routes
    // ====================================================
    app.use(express.json());
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    app.use('/auth', authRoutes);
    app.use('/users', usersRoutes);
    app.use('/fans', fansRoutes);
    app.use('/images', imagesRoutes);
    app.use('/contenu', contenuRoutes);
    app.use('/messages', messagesRoutes);

    // ====================================================
    // Gestion des erreurs
    // ====================================================
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Error:', err.stack);
      res.status(500).json({ error: err.message || 'Something broke!' });
    });

    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => {
      console.log(`✅ Server listening on http://localhost:${port}`);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
