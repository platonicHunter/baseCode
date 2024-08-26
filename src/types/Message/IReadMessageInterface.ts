import { Types } from "mongoose";
import { IReadInterface } from "../Base/IreadInterface";

export interface IReadMessageInterface<T> extends IReadInterface<T> {
  findMessages(participants: [Types.ObjectId, Types.ObjectId]): Promise<T>;
}
