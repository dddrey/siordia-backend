import { Request, Response, NextFunction } from "express";
import { authenticateUser } from "@/controllers/auth/index";
import { prisma } from "@/prisma/prismaClient";

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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

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

  test("должен вернуть существующего пользователя", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const handler = authenticateUser(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    await handler;

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "123456789" },
      include: { subscriptions: true },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("должен создать нового пользователя, если он не существует", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const handler = authenticateUser(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    await handler;

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "123456789" },
      include: { subscriptions: true },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: "123456789",
        username: "test_user",
        avatarUrl: "https://example.com/photo.jpg",
      },
      include: { subscriptions: true },
    });
    expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("должен создать пользователя без avatarUrl, если photo_url отсутствует", async () => {
    mockRequest.initData = {
      id: "123456789",
      username: "test_user",
    };

    const userWithoutAvatar = {
      ...mockUser,
      avatarUrl: null,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(userWithoutAvatar);

    const handler = authenticateUser(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    await handler;

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: "123456789",
        username: "test_user",
        avatarUrl: null,
      },
      include: { subscriptions: true },
    });
    expect(mockResponse.json).toHaveBeenCalledWith(userWithoutAvatar);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("должен выбросить ошибку, если initData отсутствует", async () => {
    mockRequest.initData = undefined;

    const handler = authenticateUser(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    await handler;

    expect(nextFunction).toHaveBeenCalledWith(
      new Error("User data not available")
    );
  });

  test("должен обработать ошибку при проблемах с базой данных", async () => {
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
});
