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
    const allowedOriginsRaw = FRONTEND_URL.split(',').map(o => o.trim()).filter(Boolean);

    // Normalization helper: trim, remove wrapping quotes/backticks, strip trailing slash, lowercase
    const normalizeOrigin = (s: string) => s.trim().replace(/^(["'`])+|(["'`])+$/g, '').replace(/\/+$/g, '').toLowerCase();

    const allowedOrigins = allowedOriginsRaw.map(normalizeOrigin);

    // Log configured allowed origins on startup (helpful to verify Render env)
    console.log('✅ CORS allowed origins (raw):', allowedOriginsRaw.join(', '));
    console.log('✅ CORS allowed origins (normalized):', allowedOrigins.join(', '));

    // Small middleware to log incoming Origin header when not in production
    app.use((req, _res, next) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('➡ Incoming Origin header:', req.headers.origin || '(none)');
      }
      next();
    });

    const DEBUG_CORS = process.env.DEBUG_CORS === 'true';

    app.use(cors({
      origin: (origin, callback) => {
        // allow requests with no origin (server-to-server tools like curl)
        if (!origin) return callback(null, true);

        if (DEBUG_CORS) {
          // echo origin for debugging (accept any origin temporarily)
          return callback(null, origin);
        }

        const normalized = normalizeOrigin(origin);
        // If origin matches allowed list, echo it back explicitly so the
        // Access-Control-Allow-Origin header is set to the requesting origin.
        if (allowedOrigins.includes(normalized)) {
          return callback(null, origin);
        }

        // Not allowed
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'], // ✅ essentiel
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }));

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
