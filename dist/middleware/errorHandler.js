"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/errors/AppError");
const errorHandler = (err, // Allow both AppError and generic Error types
req, res, next) => {
    // Ensure the return type matches Response format
    console.log(err.message ? err.message : err);
    // Handled errors
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            error: {
                type: err.type,
                message: err.message,
                details: err.details || null,
            },
        });
    }
    // Fallback to generic error handler
    return res.status(500).json({
        error: {
            type: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
        },
    });
};
exports.errorHandler = errorHandler;
