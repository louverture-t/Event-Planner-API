import mongoose from "mongoose";

import { ApiErrorCode, ApiErrorResponse, createErrorResponse } from "./http";

export class AppError extends Error {
  constructor(
    public readonly statusCode: 400 | 404 | 500,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    code: ApiErrorCode = "VALIDATION_ERROR",
  ) {
    super(400, code, message, details);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(404, "NOT_FOUND", message, details);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected server error occurred.") {
    super(500, "INTERNAL_SERVER_ERROR", message);
    this.name = "InternalServerError";
  }
}

function formatMongooseValidationError(
  error: mongoose.Error.ValidationError,
): BadRequestError {
  const details: Record<string, unknown> = {};

  for (const [field, validationError] of Object.entries(error.errors)) {
    details[field] = validationError.message;
  }

  return new BadRequestError("Request validation failed.", details);
}

function formatMongooseCastError(
  error: mongoose.Error.CastError,
): BadRequestError {
  return new BadRequestError("Request validation failed.", {
    [error.path]: error.message,
  });
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return formatMongooseValidationError(error);
  }

  if (error instanceof mongoose.Error.CastError) {
    return formatMongooseCastError(error);
  }

  return new InternalServerError();
}

export function toErrorResponse(error: unknown): {
  statusCode: number;
  body: ApiErrorResponse;
} {
  const appError = normalizeError(error);

  return {
    statusCode: appError.statusCode,
    body: createErrorResponse(appError.code, appError.message, appError.details),
  };
}