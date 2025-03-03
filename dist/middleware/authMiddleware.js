"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const prismaClient_1 = require("../prisma/prismaClient");
const AppError_1 = require("../utils/errors/AppError");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { initData } = req;
        if (!initData)
            throw new AppError_1.UnauthorizedError("No init data provided");
        const user = yield prismaClient_1.prisma.user.findUnique({
            where: {
                id: initData === null || initData === void 0 ? void 0 : initData.id.toString(),
            },
            include: {
                subscriptions: true,
            },
        });
        if (!user)
            throw new AppError_1.UnauthorizedError("User not found");
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.authMiddleware = authMiddleware;
