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
exports.updateLesson = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const AppError_1 = require("../../utils/errors/AppError");
const prismaClient_1 = require("../../prisma/prismaClient");
exports.updateLesson = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, video, about, description, tasks, isSubscriptionRequired, orderNumber, topicId, } = req.body;
    const existingLesson = yield prismaClient_1.prisma.lesson.findUnique({
        where: { id },
        include: { topic: { include: { folder: true } } },
    });
    if (!existingLesson) {
        throw new AppError_1.NotFoundError("Lesson not found");
    }
    let type = existingLesson.type;
    if (topicId && topicId !== existingLesson.topicId) {
        const newTopic = yield prismaClient_1.prisma.topic.findUnique({
            where: { id: topicId },
            include: { folder: true },
        });
        if (!newTopic) {
            throw new AppError_1.NotFoundError("New topic not found");
        }
        type = newTopic.folder.type;
    }
    const updatedLesson = yield prismaClient_1.prisma.lesson.update({
        where: { id },
        data: {
            name,
            video,
            about,
            description,
            tasks,
            isSubscriptionRequired,
            orderNumber,
            topicId,
            type,
        },
        include: { topic: { include: { folder: true } } },
    });
    res.json(updatedLesson);
}));
