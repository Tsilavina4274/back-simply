"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /fans
router.get('/', auth_1.requireAuth, async (req, res) => {
    const fans = await prisma_1.default.fan.findMany();
    return res.json({ data: fans });
});
// POST /fans
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { nom, initiale, urlAvatar, statut, derniereActivite, totalDepense } = req.body;
    const fan = await prisma_1.default.fan.create({ data: { nom, initiale, urlAvatar, statut, derniereActivite: derniereActivite ? new Date(derniereActivite) : undefined, totalDepense } });
    return res.json({ data: fan });
});
exports.default = router;
