import { Request, Response, NextFunction } from "express";
import { parseInitDataMiddleware } from "../../middleware/parseInitData";

describe("parseInitDataMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  const mockInitData =
    "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22test_user%22%2C%22language_code%22%3A%22en%22%2C%22photo_url%22%3A%22https%3A%2F%2Fexample.com%2Fphoto.jpg%22%7D&auth_date=1234567890&hash=abc123def456";

  const mockInvalidInitData =
    "query_id=AAHdF6IQAAAAAN0XohDhrOrc&auth_date=1234567890&hash=abc123def456";

  test("должен успешно парсить валидную init-data", () => {
    mockRequest.headers = {
      "init-data": mockInitData,
    };

    parseInitDataMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.initData).toEqual({
      id: "123456789",
      username: "test_user",
      photo_url: "https://example.com/photo.jpg",
    });

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  test("должен вызвать next с ошибкой при отсутствии init-data", () => {
    parseInitDataMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(
      new Error("No initData provided")
    );
  });

  test("должен вызвать next с ошибкой при отсутствии данных пользователя", () => {
    mockRequest.headers = {
      "init-data": mockInvalidInitData,
    };

    parseInitDataMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(new Error("No user data found"));
  });

  test("должен вызвать next с ошибкой при невалидных данных пользователя", () => {
    const invalidInitData =
      "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22username%22%3A%22test_user%22%2C%22photo_url%22%3A%22https%3A%2F%2Fexample.com%2Fphoto.jpg%22%7D&auth_date=1234567890&hash=abc123def456";

    mockRequest.headers = {
      "init-data": invalidInitData,
    };

    parseInitDataMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(new Error("Invalid user data"));
  });

  test("должен обрабатывать init-data без photo_url", () => {
    const initDataWithoutPhoto =
      "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22test_user%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1234567890&hash=abc123def456";

    mockRequest.headers = {
      "init-data": initDataWithoutPhoto,
    };

    parseInitDataMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.initData).toEqual({
      id: "123456789",
      username: "test_user",
      photo_url: undefined,
    });
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });
});
