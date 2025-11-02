"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const fans_1 = __importDefault(require("./routes/fans"));
const images_1 = __importDefault(require("./routes/images"));
const contenu_1 = __importDefault(require("./routes/contenu"));
const messages_1 = __importDefault(require("./routes/messages"));
dotenv_1.default.config();
async function main() {
    try {
        await prisma_1.default.$connect();
        console.log('✅ Connected to database');
        const app = (0, express_1.default)();
        // ====================================================
        // 🧩 Configuration CORS multi-origine propre
        // ====================================================
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://simply-three.vercel.app';
        const allowedOrigins = FRONTEND_URL.split(',').map(o => o.trim()).filter(Boolean);
        // Log configured allowed origins on startup (helpful to verify Render env)
        console.log('✅ CORS allowed origins (configured):', allowedOrigins.join(', '));
        // Small middleware to log incoming Origin header when not in production
        app.use((req, _res, next) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('➡ Incoming Origin header:', req.headers.origin || '(none)');
            }
            next();
        });
        const DEBUG_CORS = process.env.DEBUG_CORS === 'true';
        app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // allow requests with no origin (server-to-server tools like curl)
                if (!origin)
                    return callback(null, true);
                if (DEBUG_CORS) {
                    // echo origin for debugging (accept any origin temporarily)
                    return callback(null, origin);
                }
                // If origin matches allowed list, echo it back explicitly so the
                // Access-Control-Allow-Origin header is set to the requesting origin.
                if (allowedOrigins.includes(origin)) {
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
        app.use(express_1.default.json());
        app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
        app.use('/auth', auth_1.default);
        app.use('/users', users_1.default);
        app.use('/fans', fans_1.default);
        app.use('/images', images_1.default);
        app.use('/contenu', contenu_1.default);
        app.use('/messages', messages_1.default);
        // ====================================================
        // Gestion des erreurs
        // ====================================================
        app.use((err, req, res, next) => {
            console.error('❌ Error:', err.stack);
            res.status(500).json({ error: err.message || 'Something broke!' });
        });
        const port = Number(process.env.PORT || 3000);
        app.listen(port, () => {
            console.log(`✅ Server listening on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('❌ Server failed to start:', error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
