import { ErrorType } from "../../types/errors";

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    details?: any
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;

    // Для правильного наследования от Error
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Вспомогательные классы для конкретных типов ошибок
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorType.VALIDATION, message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(ErrorType.NOT_FOUND, message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(ErrorType.UNAUTHORIZED, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(ErrorType.FORBIDDEN, message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ErrorType.CONFLICT, message, 409);
  }
}
