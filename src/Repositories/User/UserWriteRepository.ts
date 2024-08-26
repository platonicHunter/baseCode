import { IUser, UserModel } from "../../models/User/User.model";
import { BaseWriteRepository } from "../../Repositories/Base/BaseWriteRepository";
import { generateJwtToken } from "../../config/token/token";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "../../types/User/IUserRegisterInterface";

export class UserWriteRepository extends BaseWriteRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async createUser(userInput: CreateUserInput): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userInput.password, 10);
    const user = new UserModel({
      ...userInput,
      password: hashedPassword,
    });
    const token = generateJwtToken(user._id.toString());
    user.verificationToken = token;
    const savedUser = await this.create(user);
    return savedUser;
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    return super.update(id, user);
  }

  async delete(id: string): Promise<boolean> {
    return super.delete(id);
  }
}
