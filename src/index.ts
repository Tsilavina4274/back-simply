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
    // 🧩 Configuration CORS
    // ====================================================
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://simply-three.vercel.app';
    const allowedOrigins = FRONTEND_URL.split(',').map((s) => s.trim());

    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        // Autoriser les requêtes sans "origin" (ex: Postman, Render health check)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn('❌ Requête CORS refusée depuis:', origin);
          callback(null, false); // <-- au lieu de throw Error
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions)); // important pour OPTIONS

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
      res.status(500).json({ error: 'Something broke!' });
    });

    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => {
      console.log(`✅ Server listening on http://localhost:${port}`);
      console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
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
