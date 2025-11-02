"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /contenu
router.get('/', auth_1.requireAuth, async (req, res) => {
    const contenus = await prisma_1.default.contenu.findMany();
    return res.json({ data: contenus });
});
// POST /contenu
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { titre, urlImage, prix } = req.body;
    const c = await prisma_1.default.contenu.create({ data: { titre, urlImage, prix: Number(prix || 0) } });
    return res.json({ data: c });
});
exports.default = router;
