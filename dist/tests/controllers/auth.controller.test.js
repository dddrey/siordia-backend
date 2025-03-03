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
const index_1 = require("../../controllers/auth/index");
const prismaClient_1 = require("../../prisma/prismaClient");
jest.mock("../prisma/prismaClient", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
describe("Auth Controller", () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    const mockUser = {
        id: "123456789",
        username: "test_user",
        avatarUrl: "https://example.com/photo.jpg",
        subscriptions: [],
    };
    beforeEach(() => {
        mockRequest = {
            initData: {
                id: "123456789",
                username: "test_user",
                photo_url: "https://example.com/photo.jpg",
            },
        };
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });
    test("должен вернуть существующего пользователя", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaClient_1.prisma.user.findUnique.mockResolvedValue(mockUser);
        const handler = (0, index_1.authenticateUser)(mockRequest, mockResponse, nextFunction);
        yield handler;
        expect(prismaClient_1.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: "123456789" },
            include: { subscriptions: true },
        });
        expect(prismaClient_1.prisma.user.create).not.toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        expect(nextFunction).not.toHaveBeenCalled();
    }));
    test("должен создать нового пользователя, если он не существует", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaClient_1.prisma.user.findUnique.mockResolvedValue(null);
        prismaClient_1.prisma.user.create.mockResolvedValue(mockUser);
        const handler = (0, index_1.authenticateUser)(mockRequest, mockResponse, nextFunction);
        yield handler;
        expect(prismaClient_1.prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: "123456789" },
            include: { subscriptions: true },
        });
        expect(prismaClient_1.prisma.user.create).toHaveBeenCalledWith({
            data: {
                id: "123456789",
                username: "test_user",
                avatarUrl: "https://example.com/photo.jpg",
            },
            include: { subscriptions: true },
        });
        expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        expect(nextFunction).not.toHaveBeenCalled();
    }));
    test("должен создать пользователя без avatarUrl, если photo_url отсутствует", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.initData = {
            id: "123456789",
            username: "test_user",
        };
        const userWithoutAvatar = Object.assign(Object.assign({}, mockUser), { avatarUrl: null });
        prismaClient_1.prisma.user.findUnique.mockResolvedValue(null);
        prismaClient_1.prisma.user.create.mockResolvedValue(userWithoutAvatar);
        const handler = (0, index_1.authenticateUser)(mockRequest, mockResponse, nextFunction);
        yield handler;
        expect(prismaClient_1.prisma.user.create).toHaveBeenCalledWith({
            data: {
                id: "123456789",
                username: "test_user",
                avatarUrl: null,
            },
            include: { subscriptions: true },
        });
        expect(mockResponse.json).toHaveBeenCalledWith(userWithoutAvatar);
        expect(nextFunction).not.toHaveBeenCalled();
    }));
    test("должен выбросить ошибку, если initData отсутствует", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.initData = undefined;
        const handler = (0, index_1.authenticateUser)(mockRequest, mockResponse, nextFunction);
        yield handler;
        expect(nextFunction).toHaveBeenCalledWith(new Error("User data not available"));
    }));
    test("должен обработать ошибку при проблемах с базой данных", () => __awaiter(void 0, void 0, void 0, function* () {
        const dbError = new Error("Database error");
        prismaClient_1.prisma.user.findUnique.mockRejectedValue(dbError);
        const handler = (0, index_1.authenticateUser)(mockRequest, mockResponse, nextFunction);
        yield handler;
        expect(nextFunction).toHaveBeenCalledWith(dbError);
    }));
});
