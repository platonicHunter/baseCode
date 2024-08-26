import { Types } from "mongoose";
import { IWriteInterface } from "../Base/IWriteInterface";

export interface IWriteConversationInterface<T> extends IWriteInterface<T> {
  createConversation(
    participants: [Types.ObjectId, Types.ObjectId],
    messages: Types.ObjectId[]
  ): Promise<T>;
}
