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
exports.createSubscription = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const AppError_1 = require("../../utils/errors/AppError");
const prismaClient_1 = require("../../prisma/prismaClient");
exports.createSubscription = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    if (!req.user) {
        throw new AppError_1.ValidationError("User not found");
    }
    const { id: userId, subscriptions } = req.user;
    if (!type || !Object.values(client_1.ContentType).includes(type)) {
        throw new AppError_1.ValidationError("Invalid type");
    }
    const existingSubscription = subscriptions.find((sub) => sub.type === type);
    if (existingSubscription) {
        const updatedSubscription = yield prismaClient_1.prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: existingSubscription.active
                ? {
                    endDate: new Date(existingSubscription.endDate.getTime() +
                        30 * 24 * 60 * 60 * 1000),
                }
                : {
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    active: true,
                },
        });
        return res.status(200).json(updatedSubscription);
    }
    const newSubscription = yield prismaClient_1.prisma.subscription.create({
        data: {
            userId,
            type,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    res.status(201).json(newSubscription);
}));
