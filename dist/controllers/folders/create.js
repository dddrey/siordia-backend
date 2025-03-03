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
exports.createFolder = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const prismaClient_1 = require("../../prisma/prismaClient");
const AppError_1 = require("../../utils/errors/AppError");
const client_1 = require("@prisma/client");
exports.createFolder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type, description, about } = req.body;
    if (!name || !type) {
        throw new AppError_1.ValidationError("Name and type are required");
    }
    if (!Object.values(client_1.ContentType).includes(type)) {
        throw new AppError_1.ValidationError("Invalid type");
    }
    const folder = yield prismaClient_1.prisma.folder.create({
        data: {
            name,
            type,
            description,
            about,
        },
    });
    res.status(201).json(folder);
}));
