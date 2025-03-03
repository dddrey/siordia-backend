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
const index_1 = require("../../controllers/folders/index");
const client_1 = require("@prisma/client");
const prismaClient_1 = require("../../prisma/prismaClient");
const AppError_1 = require("../../utils/errors/AppError");
jest.mock("../prisma/prismaClient", () => ({
    __esModule: true,
    default: {
        folder: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));
describe("Folder Controller", () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    const mockFolder = {
        id: "1",
        name: "Test Folder",
        type: client_1.ContentType.coach,
        about: "Test About",
        description: "Test Description",
        topics: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });
    describe("getFolderById", () => {
        test("✅ должен вернуть папку по ID", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: "1" };
            prismaClient_1.prisma.folder.findUnique.mockResolvedValue(mockFolder);
            yield (0, index_1.getFolderById)(mockRequest, mockResponse, nextFunction);
            expect(prismaClient_1.prisma.folder.findUnique).toHaveBeenCalledWith({
                where: { id: "1" },
                include: { topics: true },
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockFolder);
        }));
        test("❌ должен вернуть ошибку если папка не найдена", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: "1" };
            prismaClient_1.prisma.folder.findUnique.mockResolvedValue(null);
            yield (0, index_1.getFolderById)(mockRequest, mockResponse, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(new AppError_1.NotFoundError("Folder not found"));
        }));
    });
    describe("getFolders", () => {
        test("✅ должен вернуть все папки", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFolders = [mockFolder];
            mockRequest.query = {};
            prismaClient_1.prisma.folder.findMany.mockResolvedValue(mockFolders);
            yield (0, index_1.getFolders)(mockRequest, mockResponse, nextFunction);
            expect(prismaClient_1.prisma.folder.findMany).toHaveBeenCalledWith({
                include: { topics: true },
            });
            expect(mockResponse.json).toHaveBeenCalledWith(mockFolders);
        }));
        test("✅ должен вернуть папки по типу", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFolders = [mockFolder];
            mockRequest.query = { type: client_1.ContentType.coach };
            prismaClient_1.prisma.folder.findMany.mockResolvedValue(mockFolders);
            yield (0, index_1.getFolders)(mockRequest, mockResponse, nextFunction);
            expect(prismaClient_1.prisma.folder.findMany).toHaveBeenCalledWith({
                include: { topics: true },
                where: { type: client_1.ContentType.coach },
            });
            expect(mockResponse.json).toHaveBeenCalledWith(mockFolders);
        }));
        test("❌ должен вернуть ошибку при неверном типе", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.query = { type: "invalid" };
            yield (0, index_1.getFolders)(mockRequest, mockResponse, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(new AppError_1.ValidationError("Invalid type"));
        }));
    });
    describe("createFolder", () => {
        test("✅ должен создать новую папку", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {
                name: "Test Folder",
                type: client_1.ContentType.coach,
                about: "Test About",
                description: "Test Description",
            };
            prismaClient_1.prisma.folder.create.mockResolvedValue(mockFolder);
            yield (0, index_1.createFolder)(mockRequest, mockResponse, nextFunction);
            expect(prismaClient_1.prisma.folder.create).toHaveBeenCalledWith({
                data: mockRequest.body,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockFolder);
        }));
        test("❌ должен вернуть ошибку при отсутствии обязательных полей", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            yield (0, index_1.createFolder)(mockRequest, mockResponse, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(new AppError_1.ValidationError("Name and type are required"));
        }));
    });
    describe("updateFolder", () => {
        test("✅ должен обновить папку", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                name: "Updated Folder",
                type: client_1.ContentType.coach,
            };
            prismaClient_1.prisma.folder.update.mockResolvedValue(Object.assign(Object.assign({}, mockFolder), mockRequest.body));
            yield (0, index_1.updateFolder)(mockRequest, mockResponse, nextFunction);
            expect(prismaClient_1.prisma.folder.update).toHaveBeenCalledWith({
                where: { id: "1" },
                data: mockRequest.body,
            });
            expect(mockResponse.json).toHaveBeenCalledWith(Object.assign(Object.assign({}, mockFolder), mockRequest.body));
        }));
        test("❌ должен вернуть ошибку при отсутствии обязательных полей", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: "1" };
            mockRequest.body = {};
            yield (0, index_1.updateFolder)(mockRequest, mockResponse, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(new AppError_1.ValidationError("Name and type are required"));
        }));
    });
    describe("deleteFolder", () => {
        test("✅ должен удалить папку", () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: "1" };
            prismaClient_1.prisma.folder.delete.mockResolvedValue(mockFolder);
            yield (0, index_1.deleteFolder)(mockRequest, mockResponse, nextFunction);
            expect(prismaClient_1.prisma.folder.delete).toHaveBeenCalledWith({
                where: { id: "1" },
            });
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        }));
        // test("❌ должен вернуть ошибку если папка не найдена", async () => {});
    });
});
