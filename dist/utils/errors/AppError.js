"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
const errors_1 = require("../../types/errors");
class AppError extends Error {
    constructor(type, message, statusCode, details) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.details = details;
        // Для правильного наследования от Error
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
// Вспомогательные классы для конкретных типов ошибок
class ValidationError extends AppError {
    constructor(message, details) {
        super(errors_1.ErrorType.VALIDATION, message, 400, details);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message) {
        super(errors_1.ErrorType.NOT_FOUND, message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(errors_1.ErrorType.UNAUTHORIZED, message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(errors_1.ErrorType.FORBIDDEN, message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message) {
        super(errors_1.ErrorType.CONFLICT, message, 409);
    }
}
exports.ConflictError = ConflictError;
