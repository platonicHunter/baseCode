import { Request, Response } from "express";
import { verifyEmail } from "../../src/controllers/Email/verifyMail";
import { verifyJwtToken } from "../../src/config/token/token";
import { UserReadRepository } from "../../src/Repositories/User/UserReadRepository";
import { UserWriteRepository } from "../../src/Repositories/User/UserWriteRepository";

// Mock the dependencies
jest.mock("../../src/config/token/token");
jest.mock("../../src/Repositories/User/UserReadRepository");
jest.mock("../../src/Repositories/User/UserWriteRepository");

describe("verifyEmail Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = { params: { token: "testToken" } };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should verify email successfully", async () => {
    const mockDecoded = { id: "testUserId" };

    (verifyJwtToken as jest.Mock).mockReturnValue(mockDecoded);
    (UserReadRepository.prototype.findByVerificationTokenAndUserId as jest.Mock).mockResolvedValue(true);
    (UserWriteRepository.prototype.update as jest.Mock).mockResolvedValue({});

    await verifyEmail(req as Request, res as Response);

    // Check the parameters passed to the mocked functions
    expect(verifyJwtToken).toHaveBeenCalledWith({ token: "testToken" });

    const findByTokenAndUserIdCall = (UserReadRepository.prototype.findByVerificationTokenAndUserId as jest.Mock).mock.calls[0];
    expect(findByTokenAndUserIdCall[0]).toBe("testToken");
    expect(findByTokenAndUserIdCall[1]).toBe("testUserId");

    const updateCall = (UserWriteRepository.prototype.update as jest.Mock).mock.calls[0];
    expect(updateCall[0]).toBe("testUserId");
    expect(updateCall[1]).toEqual({ emailVerified: true });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "SUCCESS",
      message: "Email verified successfully",
    });
  });

  it("should return 400 if token is invalid or expired", async () => {
    const mockDecoded = { id: "testUserId" };

    (verifyJwtToken as jest.Mock).mockReturnValue(mockDecoded);
    (UserReadRepository.prototype.findByVerificationTokenAndUserId as jest.Mock).mockResolvedValue(null);

    await verifyEmail(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "FAILED",
      message: "Invalid or expired token",
    });
  });

  it("should return 500 if there is an internal server error", async () => {
    const mockDecoded = { id: "testUserId" };

    (verifyJwtToken as jest.Mock).mockReturnValue(mockDecoded);
    (UserReadRepository.prototype.findByVerificationTokenAndUserId as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    await verifyEmail(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: "FAILED",
      message: "Internal Server Error",
    });
  });
});
