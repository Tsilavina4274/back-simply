import { Response } from 'express';
import prisma from '../prisma';
import { ValidationError } from '../validators/userSchemas';

// Types pour les réponses API
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string | ValidationError[];
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper pour les réponses de succès
export function sendSuccess<T>(
  res: Response, 
  data: T, 
  message?: string,
  status: number = 200
): void {
  const response: ApiSuccessResponse<T> = { data };
  if (message) response.message = message;
  res.status(status).json(response);
}

// Helper pour les réponses d'erreur
export function sendError(
  res: Response, 
  error: string | Error | ValidationError[], 
  status: number = 500,
  code?: string
): void {
  console.error(error);
  
  const errorResponse: ApiErrorResponse = {
    error: error instanceof Error ? error.message : error
  };
  
  if (code) errorResponse.code = code;
  res.status(status).json(errorResponse);
}

// Helper pour formater la réponse utilisateur
export function formatUserResponse(user: any) {
  if (!user) return null;

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
export function isErrorResponse(response: any): response is ApiErrorResponse {
  return 'error' in response;
}

// Helper pour créer une réponse d'erreur personnalisée
export function createErrorResponse(
  message: string, 
  code?: string, 
  validationErrors?: ValidationError[]
): ApiErrorResponse {
  return {
    error: validationErrors || message,
    code
  };
}