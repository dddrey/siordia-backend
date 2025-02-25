import { NextFunction, Request, Response } from "express";
import {
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderById,
  getFolders,
} from "@/controllers/folders/index";
import { ContentType } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import { NotFoundError, ValidationError } from "../../utils/errors/AppError";

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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const mockFolder = {
    id: "1",
    name: "Test Folder",
    type: ContentType.coach,
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
    test("✅ должен вернуть папку по ID", async () => {
      mockRequest.params = { id: "1" };
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(mockFolder);

      await getFolderById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.folder.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: { topics: true },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFolder);
    });

    test("❌ должен вернуть ошибку если папка не найдена", async () => {
      mockRequest.params = { id: "1" };
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(null);

      await getFolderById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        new NotFoundError("Folder not found")
      );
    });
  });

  describe("getFolders", () => {
    test("✅ должен вернуть все папки", async () => {
      const mockFolders = [mockFolder];
      mockRequest.query = {};
      (prisma.folder.findMany as jest.Mock).mockResolvedValue(mockFolders);

      await getFolders(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.folder.findMany).toHaveBeenCalledWith({
        include: { topics: true },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockFolders);
    });

    test("✅ должен вернуть папки по типу", async () => {
      const mockFolders = [mockFolder];
      mockRequest.query = { type: ContentType.coach };
      (prisma.folder.findMany as jest.Mock).mockResolvedValue(mockFolders);

      await getFolders(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.folder.findMany).toHaveBeenCalledWith({
        include: { topics: true },
        where: { type: ContentType.coach },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockFolders);
    });

    test("❌ должен вернуть ошибку при неверном типе", async () => {
      mockRequest.query = { type: "invalid" };

      await getFolders(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        new ValidationError("Invalid type")
      );
    });
  });

  describe("createFolder", () => {
    test("✅ должен создать новую папку", async () => {
      mockRequest.body = {
        name: "Test Folder",
        type: ContentType.coach,
        about: "Test About",
        description: "Test Description",
      };
      (prisma.folder.create as jest.Mock).mockResolvedValue(mockFolder);

      await createFolder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.folder.create).toHaveBeenCalledWith({
        data: mockRequest.body,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFolder);
    });

    test("❌ должен вернуть ошибку при отсутствии обязательных полей", async () => {
      mockRequest.body = {};

      await createFolder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        new ValidationError("Name and type are required")
      );
    });
  });

  describe("updateFolder", () => {
    test("✅ должен обновить папку", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = {
        name: "Updated Folder",
        type: ContentType.coach,
      };
      (prisma.folder.update as jest.Mock).mockResolvedValue({
        ...mockFolder,
        ...mockRequest.body,
      });

      await updateFolder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.folder.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: mockRequest.body,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockFolder,
        ...mockRequest.body,
      });
    });

    test("❌ должен вернуть ошибку при отсутствии обязательных полей", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = {};

      await updateFolder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        new ValidationError("Name and type are required")
      );
    });
  });

  describe("deleteFolder", () => {
    test("✅ должен удалить папку", async () => {
      mockRequest.params = { id: "1" };
      (prisma.folder.delete as jest.Mock).mockResolvedValue(mockFolder);

      await deleteFolder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.folder.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    // test("❌ должен вернуть ошибку если папка не найдена", async () => {});
  });
});
