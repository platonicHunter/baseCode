import { Types } from "mongoose";
import { IReadInterface } from "../Base/IreadInterface";
import { IConversation } from "../../models/Message/Conversation.model";

export interface IReadConversationInterface<T> extends IReadInterface<T> {
  findConversation(participants: [Types.ObjectId, Types.ObjectId]): Promise<T>;
}
