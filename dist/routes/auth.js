"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// POST /auth/register
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        return res.status(400).json({ error: 'Email already used' });
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({ data: { email, password: hashed, name } });
    return res.json({ data: { user: { id: user.id, email: user.email, name: user.name } } });
});
// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const secret = process.env.JWT_SECRET || 'change_me_to_a_secret';
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: '7d' });
    return res.json({ data: { token, user: { id: user.id, email: user.email, name: user.name } } });
});
exports.default = router;
