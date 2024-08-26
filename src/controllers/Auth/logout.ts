import { Request, Response } from "express";
import { userReadRepository, userWriteRepository } from "./login";
import { IGetUserAuthInfoRequest } from "../Message/message";

export async function logoutUser(req: IGetUserAuthInfoRequest, res: Response) {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      return res.status(400).json({
        status: "FAILED",
        message: "User ID is missing",
      });
    }
    const user = await userReadRepository.findById(userId);
    if (!user) {
      return res.status(400).json({
        status: "FAILED",
        message: "User not found",
      });
    }
    user.refreshToken = null;
    await userWriteRepository.update(userId, user);

    res
      .status(200)
      .json({ status: "SUCCESS", message: "Logged out successfully" });
  } catch (error) {
    console.log("Error logging out user", error);
    res
      .status(500)
      .json({ status: "FAILED", message: "Internal Server Error" });
  }
}
