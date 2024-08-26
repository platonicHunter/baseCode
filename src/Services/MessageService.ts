import { Types } from "mongoose";
import { IConversation } from "../models/Message/Conversation.model";
import { IMessage } from "../models/Message/Message.model";
import { IReadConversationInterface } from "../types/Message/IReadConversationInterface";
import { IReadMessageInterface } from "../types/Message/IReadMessageInterface";
import { IWriteConversationInterface } from "../types/Message/IWriteConversationInterface";
import { IWriteMessageInterface } from "../types/Message/IWriteMessageInterface";

export class MessageService {
  constructor(
    private conversationReadRepository: IReadConversationInterface<IConversation | null>,
    private conversationWriteRepository: IWriteConversationInterface<IConversation>,
    private messageReadRepository: IReadMessageInterface<IMessage | null>,
    private messageWriteRepository: IWriteMessageInterface<IMessage>
  ) {}

  async createConversation(
    participants: [Types.ObjectId, Types.ObjectId]
  ): Promise<IConversation> {
    const conversation =
      await this.conversationWriteRepository.createConversation(
        participants,
        []
      );
    return conversation;
  }

  async findConversation(
    participants: [Types.ObjectId, Types.ObjectId]
  ): Promise<IConversation> {
    let conversation = await this.conversationReadRepository.findConversation(
      participants
    );
    if (!conversation) {
      conversation = await this.createConversation(participants);
    }
    return conversation;
  }

  async createMessage(
    participants: [Types.ObjectId, Types.ObjectId],
    message: string
  ): Promise<Types.ObjectId> {
    console.log("Participants:", participants);
    console.log("Message:", message);
    const [senderId, receiverId] = participants;
    const newMessage = await this.messageWriteRepository.createMessage(
      senderId,
      receiverId,
      message
    );
    console.log("New Message in message service", newMessage);
    const newMessageId: Types.ObjectId = newMessage._id as Types.ObjectId;
    return newMessageId;
  }

  async addMessageToConversation(
    conversationId: Types.ObjectId,
    messageId: Types.ObjectId
  ): Promise<void> {
    const conversation = await this.conversationReadRepository.findById(
      conversationId.toString()
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.messages.push(messageId);
    await conversation.save();
  }
}
