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
const authMiddleware_1 = require("../../middleware/authMiddleware");
const AppError_1 = require("../../utils/errors/AppError");
const prismaClient_1 = require("../../prisma/prismaClient");
const index_1 = require("../../controllers/auth/index");
jest.mock("../prisma/prismaClient", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));
describe("authMiddleware", () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    beforeEach(() => {
        mockRequest = {
            initData: {
                id: "123456789",
                username: "test_user",
                photo_url: "https://example.com/photo.jpg",
            },
        };
        mockResponse = {};
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });
    test("должен выбросить ошибку, если initData отсутствует", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.initData = undefined;
        yield (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(new AppError_1.UnauthorizedError("No init data provided"));
    }));
    test("должен выбросить ошибку, если пользователь не найден", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.initData = {
            id: "123456789",
            username: "test_user",
            photo_url: "https://example.com/photo.jpg",
        };
        yield (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith(new AppError_1.UnauthorizedError("User not found"));
    }));
    test("должен обрабатывать ошибку при проблемах с базой данных", () => __awaiter(void 0, void 0, void 0, function* () {
        const dbError = new Error("Database error");
        prismaClient_1.prisma.user.findUnique.mockRejectedValue(dbError);
        const handler = (0, index_1.authenticateUser)(mockRequest, mockResponse, nextFunction);
        yield handler;
        expect(nextFunction).toHaveBeenCalledWith(dbError);
    }));
    test("должен добавить пользователя в request", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = {
            id: "123456789",
            username: "test_user",
            photo_url: "https://example.com/photo.jpg",
        };
        prismaClient_1.prisma.user.findUnique.mockResolvedValue(user);
        yield (0, authMiddleware_1.authMiddleware)(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.user).toEqual(user);
    }));
});
