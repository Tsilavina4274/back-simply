"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /images
router.get('/', auth_1.requireAuth, async (req, res) => {
    const images = await prisma_1.default.image.findMany();
    return res.json({ data: images });
});
// POST /images
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { url, price, versionTag, versionColor } = req.body;
    const image = await prisma_1.default.image.create({ data: { url, price, versionTag, versionColor } });
    return res.json({ data: image });
});
exports.default = router;
