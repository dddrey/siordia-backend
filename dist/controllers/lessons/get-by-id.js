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
exports.getLessonById = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const AppError_1 = require("../../utils/errors/AppError");
const prismaClient_1 = require("../../prisma/prismaClient");
const index_1 = require("../../utils/subscription/index");
exports.getLessonById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentLesson = yield prismaClient_1.prisma.lesson.findUnique({
        where: { id },
        include: { topic: true },
    });
    if (!currentLesson) {
        throw new AppError_1.NotFoundError("Lesson not found");
    }
    const isHavePermission = (0, index_1.hasActiveSubscription)(req, currentLesson.type);
    if (currentLesson.isSubscriptionRequired && !isHavePermission) {
        throw new AppError_1.ForbiddenError("You need an active subscription to access this lesson");
    }
    yield prismaClient_1.prisma.lesson.update({
        where: { id },
        data: { views: currentLesson.views + 1 },
    });
    const [previousLesson, nextLesson] = yield Promise.all([
        prismaClient_1.prisma.lesson.findFirst({
            where: {
                topicId: currentLesson.topicId,
                orderNumber: { lt: currentLesson.orderNumber },
            },
            orderBy: { orderNumber: "desc" },
            select: { id: true },
        }),
        prismaClient_1.prisma.lesson.findFirst({
            where: {
                topicId: currentLesson.topicId,
                orderNumber: { gt: currentLesson.orderNumber },
            },
            orderBy: { orderNumber: "asc" },
            select: { id: true },
        }),
    ]);
    res.json({
        lesson: currentLesson,
        previousLessonId: (previousLesson === null || previousLesson === void 0 ? void 0 : previousLesson.id) || null,
        nextLessonId: (nextLesson === null || nextLesson === void 0 ? void 0 : nextLesson.id) || null,
    });
}));
