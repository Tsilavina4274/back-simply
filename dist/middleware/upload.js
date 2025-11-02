"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuration du stockage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/avatars');
        // Créer le dossier s'il n'existe pas
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Utiliser l'ID de l'utilisateur dans le nom du fichier
        const userId = req.user?.id;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `avatar-${userId}${ext}`);
    }
});
// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};
// Configuration de l'upload
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});
// Gestionnaire d'erreurs pour multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            error: err.message
        });
    }
    if (err) {
        return res.status(400).json({
            error: err.message
        });
    }
    next();
};
exports.handleUploadError = handleUploadError;
