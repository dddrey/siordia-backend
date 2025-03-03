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
exports.createLesson = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const AppError_1 = require("../../utils/errors/AppError");
const AppError_2 = require("../../utils/errors/AppError");
const prismaClient_1 = require("../../prisma/prismaClient");
exports.createLesson = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, video, about, description, tasks, isSubscriptionRequired, topicId, } = req.body;
    if (!name || !video || !topicId) {
        throw new AppError_2.ValidationError("Name, video and topicId are required");
    }
    const topic = yield prismaClient_1.prisma.topic.findUnique({
        where: { id: topicId },
        include: { folder: true },
    });
    if (!topic) {
        throw new AppError_1.NotFoundError("Topic not found");
    }
    const lastLesson = yield prismaClient_1.prisma.lesson.findFirst({
        where: { topicId },
        orderBy: { orderNumber: "desc" },
    });
    const nextOrderNumber = ((lastLesson === null || lastLesson === void 0 ? void 0 : lastLesson.orderNumber) || 0) + 1;
    const lesson = yield prismaClient_1.prisma.lesson.create({
        data: {
            name,
            video,
            about,
            description,
            tasks: tasks || [],
            orderNumber: nextOrderNumber,
            isSubscriptionRequired: isSubscriptionRequired !== null && isSubscriptionRequired !== void 0 ? isSubscriptionRequired : true,
            type: topic.folder.type,
            topicId,
        },
        include: {
            topic: {
                include: {
                    folder: true,
                },
            },
        },
    });
    res.status(201).json(lesson);
}));
