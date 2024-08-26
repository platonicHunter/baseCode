import { IUser } from "../../models/User/User.model";
import { IWriteInterface } from "../Base/IWriteInterface";
import { CreateUserInput } from "./IUserRegisterInterface";

export interface IUserWriteInterface<T> extends IWriteInterface<T> {
  createUser(input: CreateUserInput): Promise<IUser>;
}
