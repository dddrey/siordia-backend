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
exports.createTopic = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const prismaClient_1 = require("../../prisma/prismaClient");
const AppError_1 = require("../../utils/errors/AppError");
exports.createTopic = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, about, description, folderId } = req.body;
    if (!name || !folderId) {
        throw new AppError_1.ValidationError("Name and folderId are required");
    }
    const folder = yield prismaClient_1.prisma.folder.findUnique({
        where: { id: folderId },
    });
    if (!folder) {
        throw new AppError_1.ValidationError(`Folder with ID ${folderId} not found`);
    }
    const topic = yield prismaClient_1.prisma.topic.create({
        data: {
            name,
            about,
            description,
            folderId,
            type: folder.type,
        },
        include: {
            folder: true,
        },
    });
    res.status(201).json(topic);
}));
