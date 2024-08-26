import { Types } from "mongoose";
import ConversationModel, {
  IConversation,
} from "../../models/Message/Conversation.model";
import { IWriteConversationInterface } from "../../types/Message/IWriteConversationInterface";
import { BaseWriteRepository } from "../Base/BaseWriteRepository";

export class ConversationWriteRepository
  extends BaseWriteRepository<IConversation>
  implements IWriteConversationInterface<IConversation>
{
  constructor() {
    super(ConversationModel);
  }

  async createConversation(
    participants: [Types.ObjectId, Types.ObjectId],
    messages: Types.ObjectId[] = []
  ): Promise<IConversation> {
    const [senderId, receiverId] = participants;
    const conversation = await this.create({
      participants: [senderId, receiverId],
      messages,
    });
    return conversation;
  }
}
