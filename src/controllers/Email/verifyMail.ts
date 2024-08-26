import { Request, Response } from "express";
import { verifyJwtToken } from "../../config/token/token";
import { UserWriteRepository } from "../../Repositories/User/UserWriteRepository";
import { UserReadRepository } from "../../Repositories/User/UserReadRepository";

const userReadRepository = new UserReadRepository();
const userWriteRepository = new UserWriteRepository();

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.params;

  try {
    const decoded = verifyJwtToken({ token });

    const verificationRecord =
      await userReadRepository.findByVerificationTokenAndUserId(
        token,
        decoded.id
      );

    if (!verificationRecord) {
      res.status(400).json({
        status: "FAILED",
        message: "Invalid or expired token",
      });
      return;
    }
    await userWriteRepository.update(decoded.id, { emailVerified: true });
    res.status(200).json({
      status: "SUCCESS",
      message: "Email verified successfully",
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      status: "FAILED",
      message: err.message,
    });
  }
}
