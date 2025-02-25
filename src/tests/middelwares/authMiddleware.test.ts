import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { UnauthorizedError } from "../../utils/errors/AppError";
import { prisma } from "../../prisma/prismaClient";
import { authenticateUser } from "@/controllers/auth/index";

jest.mock("../prisma/prismaClient", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

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

  test("должен выбросить ошибку, если initData отсутствует", async () => {
    mockRequest.initData = undefined;

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(
      new UnauthorizedError("No init data provided")
    );
  });

  test("должен выбросить ошибку, если пользователь не найден", async () => {
    mockRequest.initData = {
      id: "123456789",
      username: "test_user",
      photo_url: "https://example.com/photo.jpg",
    };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(
      new UnauthorizedError("User not found")
    );
  });

  test("должен обрабатывать ошибку при проблемах с базой данных", async () => {
    const dbError = new Error("Database error");
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(dbError);

    const handler = authenticateUser(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    await handler;

    expect(nextFunction).toHaveBeenCalledWith(dbError);
  });

  test("должен добавить пользователя в request", async () => {
    const user = {
      id: "123456789",
      username: "test_user",
      photo_url: "https://example.com/photo.jpg",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.user).toEqual(user);
  });
});
