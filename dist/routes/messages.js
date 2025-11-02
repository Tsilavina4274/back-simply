"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /messages?from=...&to=...
router.get('/', auth_1.requireAuth, async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to)
        return res.status(400).json({ error: 'Missing from/to' });
    const msgs = await prisma_1.default.message.findMany({
        where: { OR: [{ fromId: from, toId: to }, { fromId: to, toId: from }] },
        orderBy: { createdAt: 'asc' }
    });
    return res.json({ data: msgs });
});
// POST /messages
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { fromId, toId, content } = req.body;
    if (!fromId || !toId || !content)
        return res.status(400).json({ error: 'Missing fields' });
    const msg = await prisma_1.default.message.create({ data: { fromId, toId, content } });
    return res.json({ data: msg });
});
exports.default = router;
