"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const AppError_1 = require("../utils/errors/AppError");
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        throw new AppError_1.ForbiddenError("Access denied. Admin rights required.");
    }
    next();
};
exports.isAdmin = isAdmin;
