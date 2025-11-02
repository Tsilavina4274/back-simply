"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.formatUserResponse = formatUserResponse;
exports.isErrorResponse = isErrorResponse;
exports.createErrorResponse = createErrorResponse;
// Helper pour les réponses de succès
function sendSuccess(res, data, message, status = 200) {
    const response = { data };
    if (message)
        response.message = message;
    res.status(status).json(response);
}
// Helper pour les réponses d'erreur
function sendError(res, error, status = 500, code) {
    console.error(error);
    const errorResponse = {
        error: error instanceof Error ? error.message : error
    };
    if (code)
        errorResponse.code = code;
    res.status(status).json(errorResponse);
}
// Helper pour formater la réponse utilisateur
function formatUserResponse(user) {
    if (!user)
        return null;
    const { password, ...userWithoutPassword } = user;
    return {
        ...userWithoutPassword,
        status: user.status ?? null,
        performance: user.performance ?? null,
        settings: {
            emailNotifications: user.emailNotifications ?? false,
            pushNotifications: user.pushNotifications ?? false,
            marketingEmails: user.marketingEmails ?? false,
            securityAlerts: user.securityAlerts ?? true
        },
        social: {
            facebook: user.facebook ?? null,
            twitter: user.twitter ?? null,
            instagram: user.instagram ?? null,
            linkedin: user.linkedin ?? null
        }
    };
}
// Helper pour vérifier si une réponse est une erreur
function isErrorResponse(response) {
    return 'error' in response;
}
// Helper pour créer une réponse d'erreur personnalisée
function createErrorResponse(message, code, validationErrors) {
    return {
        error: validationErrors || message,
        code
    };
}
