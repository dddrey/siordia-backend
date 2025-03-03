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
exports.getFolders = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const AppError_1 = require("../../utils/errors/AppError");
const prismaClient_1 = require("../../prisma/prismaClient");
const client_1 = require("@prisma/client");
exports.getFolders = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.query.type;
    const queryOptions = {
        include: {
            topics: true,
        },
    };
    if (type) {
        if (!Object.values(client_1.ContentType).includes(type)) {
            throw new AppError_1.ValidationError("Invalid type");
        }
        queryOptions.where = {
            type: type,
        };
    }
    const folders = yield prismaClient_1.prisma.folder.findMany(queryOptions);
    res.json(folders);
}));
