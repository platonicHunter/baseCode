import bcrypt from "bcryptjs";
import {
  AuthenticateUserInput,
  CreateUserInput,
} from "../types/User/IUserRegisterInterface";
import { IUser } from "../models/User/User.model";
import { IUserReadInterface } from "../types/User/IUserReadInterface";
import { IUserWriteInterface } from "../types/User/IUserWriteInterface";
import { verifyJwtToken } from "../config/token/token";
import agenda from "../controllers/Email/agenda";
import { NotificationService } from "./NotificationService";

export class UserService {
  constructor(
    private userReadRepository: IUserReadInterface<IUser>,
    private userWriteRepository: IUserWriteInterface<IUser>,
    private notificationService: NotificationService
  ) {}

  async createUser(input: CreateUserInput): Promise<IUser> {
    const user = await this.userWriteRepository.createUser(input);
    const verificationRecord = await this.userReadRepository.findById(user.id);

    if (verificationRecord && user.verificationToken) {
      await this.notificationService.scheduleVerificationEmail(
        user.email,
        user.verificationToken
      );
    }

    return user;
  }

  async authenticateUser(input: AuthenticateUserInput): Promise<IUser | null> {
    const user = await this.userReadRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordMatch = await bcrypt.compare(input.password, user.password);
    if (isPasswordMatch) {
      return user;
    } else {
      return null;
    }
  }

  async verifyUserEmail(token: string): Promise<boolean> {
    let decoded;
    try {
      decoded = verifyJwtToken({ token });
    } catch (err) {
      throw new Error("Invalid or expired verification token");
    }
    const userId = decoded.Id || decoded.id;
    const user = await this.userReadRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.emailVerified = true;
    await this.userWriteRepository.update(user._id.toString(), user);
    return true;
  }
}
