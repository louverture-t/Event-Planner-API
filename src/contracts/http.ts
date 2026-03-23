export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorCode =
  | "INVALID_OBJECT_ID"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}