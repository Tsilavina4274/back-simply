"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const userSchemas_1 = require("../validators/userSchemas");
const apiResponse_1 = require("../utils/apiResponse");
function validateRequest(schema) {
    return async (req, res, next) => {
        try {
            const validation = schema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: (0, userSchemas_1.formatZodError)(validation.error) });
            }
            req.validatedData = validation.data;
            next();
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, err, 400);
        }
    };
}
