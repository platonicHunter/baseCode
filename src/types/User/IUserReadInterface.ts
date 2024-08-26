import { IUser } from "../../models/User/User.model";
import { IReadInterface } from "../Base/IreadInterface";

export interface IUserReadInterface<T> extends IReadInterface<T> {
  findByEmail(email: string): Promise<IUser | null>;
  findByName(name: string): Promise<IUser | null>;
  findByVerificationTokenAndUserId(
    email: string,
    token: string
  ): Promise<IUser | null>;
}
