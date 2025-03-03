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
exports.authenticateUser = void 0;
const prismaClient_1 = require("../../prisma/prismaClient");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const AppError_1 = require("../../utils/errors/AppError");
exports.authenticateUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { initData } = req;
    if (!initData) {
        throw new AppError_1.UnauthorizedError("User data not available");
    }
    let user = yield prismaClient_1.prisma.user.findUnique({
        where: { id: initData.id },
        include: {
            subscriptions: true,
        },
    });
    if (!user) {
        user = yield prismaClient_1.prisma.user.create({
            data: {
                id: initData.id,
                username: initData.username,
                avatarUrl: initData.photo_url || null,
            },
            include: {
                subscriptions: true,
            },
        });
    }
    return res.json(user);
}));
