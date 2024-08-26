import { Types } from "mongoose";
import ConversationModel, {
  IConversation,
} from "../../models/Message/Conversation.model";
import { IReadConversationInterface } from "../../types/Message/IReadConversationInterface";
import { BaseReadRepository } from "../Base/BaseReadRepository";

export class ConversationReadRepository
  extends BaseReadRepository<IConversation>
  implements IReadConversationInterface<IConversation | null>
{
  constructor() {
    super(ConversationModel);
  }

  async findConversation(
    participants: [Types.ObjectId, Types.ObjectId]
  ): Promise<IConversation | null> {
    const [senderId, receiverId] = participants;
    const conversation = await this.findOne({
      participants: [senderId, receiverId],
    });
    return conversation;
  }
}
