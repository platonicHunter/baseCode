import { Request, Response } from "express";
import { Types } from "mongoose";
import { logoutUser } from "../../src/controllers/Auth/logout";
import { userReadRepository, userWriteRepository } from "../../src/controllers/Auth/login";

// Mock the repositories
jest.mock("../../src/controllers/Auth/login", () => ({
  userReadRepository: {
    findById: jest.fn(),
  },
  userWriteRepository: {
    update: jest.fn(),
  },
}));

// Define a custom type for Request with user property
interface CustomRequest extends Request {
  user?: { _id: Types.ObjectId }; // Use ObjectId type from mongoose
}

describe("Logout Controller", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      user: { _id: new Types.ObjectId("507f191e810c19729de860ea") }, // Use ObjectId type
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if user ID is missing", async () => {
    req.user = undefined; // Simulate missing user ID

    await logoutUser(req as CustomRequest, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "FAILED",
      message: "User ID is missing",
    });
  });

  it("should return 400 if user is not found", async () => {
    (userReadRepository.findById as jest.Mock).mockResolvedValue(null);

    await logoutUser(req as CustomRequest, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "FAILED",
      message: "User not found",
    });
  });

  it("should return 200 and log out user successfully", async () => {
    (userReadRepository.findById as jest.Mock).mockResolvedValue({
      _id: new Types.ObjectId("507f191e810c19729de860ea"), // Use ObjectId type
      refreshToken: "some-refresh-token",
    });

    (userWriteRepository.update as jest.Mock).mockResolvedValue(undefined);

    await logoutUser(req as CustomRequest, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "SUCCESS",
      message: "Logged out successfully",
    });

    const updateMock = userWriteRepository.update as jest.MockedFunction<typeof userWriteRepository.update>;

    expect(updateMock).toHaveBeenCalledWith("507f191e810c19729de860ea", {
      _id: new Types.ObjectId("507f191e810c19729de860ea"),
      refreshToken: null,
    });
  });

  it("should return 500 if there is an internal server error", async () => {
    (userReadRepository.findById as jest.Mock).mockRejectedValue(new Error("Some error"));

    await logoutUser(req as CustomRequest, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "FAILED",
      message: "Internal Server Error",
    });
  });
});
