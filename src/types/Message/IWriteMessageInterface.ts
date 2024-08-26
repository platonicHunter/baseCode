import { Types } from "mongoose";
import { IWriteInterface } from "../Base/IWriteInterface";

export interface IWriteMessageInterface<T> extends IWriteInterface<T> {
  createMessage(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
    message: string
  ): Promise<T>;
}
