import { UserModel, IUser } from "../../models/User/User.model";
import { IUserReadInterface } from "../../types/User/IUserReadInterface";
import { BaseReadRepository } from "../Base/BaseReadRepository";

export class UserReadRepository
  extends BaseReadRepository<IUser>
  implements IUserReadInterface<IUser>
{
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }

  async findByName(name: string): Promise<IUser | null> {
    return this.model.findOne({ name }).exec();
  }

  async findByVerificationTokenAndUserId(
    token: string,
    userId: string
  ): Promise<IUser | null> {
    return UserModel.findOne({ verificationToken: token, _id: userId }).exec();
  }
}
