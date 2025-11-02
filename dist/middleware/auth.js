"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
        return res.status(401).json({ error: 'Missing token' });
    const token = auth.replace('Bearer ', '');
    try {
        const secret = process.env.JWT_SECRET || 'change_me_to_a_secret';
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: payload.userId };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
