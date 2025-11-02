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
// Charger les variables d'environnement
dotenv_1.default.config();
async function main() {
    try {
        // Vérifier la connexion à la base de données
        await prisma_1.default.$connect();
        console.log('✅ Connected to database');
        const app = (0, express_1.default)();
        // ====================================================
        // 🧩 Configuration CORS
        // ====================================================
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://simply-three.vercel.app';
        const allowedOrigins = FRONTEND_URL.split(',').map((s) => s.trim());
        const corsOptions = {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        };
        app.use((0, cors_1.default)(corsOptions));
        // Permet à Express de répondre aux requêtes préflight (OPTIONS)
        app.options('*', (0, cors_1.default)(corsOptions));
        // ====================================================
        // 🧩 Middlewares & Routes
        // ====================================================
        app.use(express_1.default.json());
        app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
        // Routes principales
        app.use('/auth', auth_1.default);
        app.use('/users', users_1.default);
        app.use('/fans', fans_1.default);
        app.use('/images', images_1.default);
        app.use('/contenu', contenu_1.default);
        app.use('/messages', messages_1.default);
        // ====================================================
        // 🧩 Gestion des erreurs
        // ====================================================
        app.use((err, req, res, next) => {
            console.error('❌ Error:', err.stack);
            res.status(500).json({ error: 'Something broke!' });
        });
        // ====================================================
        // 🚀 Lancement du serveur
        // ====================================================
        const port = Number(process.env.PORT || 3000);
        app.listen(port, () => {
            console.log(`✅ Server listening on http://localhost:${port}`);
            console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
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
