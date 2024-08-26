import { Types } from "mongoose";
import MessageModel, { IMessage } from "../../models/Message/Message.model";
import { IWriteMessageInterface } from "../../types/Message/IWriteMessageInterface";
import { BaseWriteRepository } from "../Base/BaseWriteRepository";

export class MessageWriteRepository
  extends BaseWriteRepository<IMessage>
  implements IWriteMessageInterface<IMessage>
{
  constructor() {
    super(MessageModel);
  }
  async createMessage(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,

    message: string
  ): Promise<IMessage> {
    const newMessage = new MessageModel({
      senderId,
      receiverId,
      message,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("New Message:", newMessage);
    const savedMessage = await this.create(newMessage);
    console.log("Saved Message:", savedMessage);
    return savedMessage;
  }
}
