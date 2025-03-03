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
exports.getLessons = void 0;
const prismaClient_1 = require("../../prisma/prismaClient");
const asyncHandler_1 = require("../../middleware/asyncHandler");
exports.getLessons = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topicId = req.query.topicId;
    if (!topicId) {
        const lessons = yield prismaClient_1.prisma.lesson.findMany({
            include: {
                topic: {
                    include: {
                        folder: true,
                    },
                },
            },
            orderBy: { orderNumber: "asc" },
        });
        res.json(lessons);
    }
    else {
        const lessons = yield prismaClient_1.prisma.lesson.findMany({
            where: { topicId },
            include: {
                topic: {
                    include: {
                        folder: true,
                    },
                },
            },
            orderBy: { orderNumber: "asc" },
        });
        res.json(lessons);
    }
}));
