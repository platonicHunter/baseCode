import { Request, Response } from "express";
import { UserService } from "../../Services/UserService";
import { AuthenticateUserInput } from "../../types/User/IUserRegisterInterface";
import { UserReadRepository } from "../../Repositories/User/UserReadRepository";
import { UserWriteRepository } from "../../Repositories/User/UserWriteRepository";
import { NotificationRepository } from "../../Repositories/Notification/NotificationRepository";
import { NotificationService } from "../../Services/NotificationService";
import { validationResult } from "express-validator";

export const userReadRepository = new UserReadRepository();
export const userWriteRepository = new UserWriteRepository();
export const notificationRepository = new NotificationRepository();
export const notificationService = new NotificationService(
  notificationRepository
);
export const userService = new UserService(
  userReadRepository,
  userWriteRepository,
  notificationService
);
export default function makeLogin() {
  return async function login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          status: "FAILED",
          message: "Email and password are required",
        });
        return;
      }

      const input: AuthenticateUserInput = {
        email,
        password: password.trim(),
      };

      const user = await userService.authenticateUser(input);

      if (!user) {
        res.status(400).json({
          status: "FAILED",
          message: "User not found or password is incorrect",
        });
        return;
      }

      const id = user._id.toString();
      console.log("ID in login:", id);
      user.isLogin = true;
      await userWriteRepository.update(id, user);
      res.status(200).json({
        status: "SUCCESS",
        message: "User authenticated successfully",
        data: user,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        status: "FAILED",
        message: err.message,
      });
    }
  };
}
