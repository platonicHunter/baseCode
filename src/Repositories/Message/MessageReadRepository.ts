import { Types } from "mongoose";
import MessageModel, { IMessage } from "../../models/Message/Message.model";
import { IReadMessageInterface } from "../../types/Message/IReadMessageInterface";
import { BaseReadRepository } from "../Base/BaseReadRepository";

export class MessageReadRepository
  extends BaseReadRepository<IMessage>
  implements IReadMessageInterface<IMessage | null>
{
  constructor() {
    super(MessageModel);
  }

  async findMessages(
    participants: [Types.ObjectId, Types.ObjectId]
  ): Promise<IMessage | null> {
    const [senderId, receiverId] = participants;
    const messages = await this.findOne({
      senderId,
      receiverId,
    });
    if (!messages) throw new Error("Messages are not found");
    return messages;
  }
}
