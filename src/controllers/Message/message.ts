import { Request, Response } from "express";
export interface IGetUserAuthInfoRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    user?: IUser;
  };
}
import { purify } from "../../server";
import { MessageService } from "../../Services/MessageService";
import { ConversationReadRepository } from "../../Repositories/Message/ConversationReadRepository";
import { ConversationWriteRepository } from "../../Repositories/Message/ConversationWriteRepository";
import { MessageReadRepository } from "../../Repositories/Message/MessageReadRepository";
import { MessageWriteRepository } from "../../Repositories/Message/MessageWriteRepository";
import { Types } from "mongoose";
import { getReceiverSocketId, io } from "../../Socket/socket";
import { IUser } from "../../models/User/User.model";

const conversationReadRepository = new ConversationReadRepository();
const conversationWriteRepository = new ConversationWriteRepository();
const messageReadRepository = new MessageReadRepository();
const messageWriteRepository = new MessageWriteRepository();
const messageService = new MessageService(
  conversationReadRepository,
  conversationWriteRepository,
  messageReadRepository,
  messageWriteRepository
);

export function sendMessage() {
  return async function (
    req: IGetUserAuthInfoRequest,
    res: Response
  ): Promise<void> {
    console.log("Sending message is called");
    try {
      const sanitizedMessage = purify.sanitize(req.body.message);
      console.log("SanitizedMessage:", sanitizedMessage);

      const { id: receiverId } = req.params;
      console.log("ReceiverId:", receiverId);
      const senderId = req.user?._id;
      console.log("SenderId:", senderId);

      if (!senderId || !receiverId) {
        throw new Error("Sender or receiver ID is missing");
      }

      const senderObjectId = new Types.ObjectId(senderId);
      console.log("Sender ObjectId:", senderObjectId);
      const receiverObjectId = new Types.ObjectId(receiverId);
      console.log("Receiver ObjectId:", receiverObjectId);

      let conversation = await messageService.findConversation([
        senderObjectId,
        receiverObjectId,
      ]);
      console.log("Conversation:", conversation);

      const newMessage = await messageService.createMessage(
        [senderObjectId, receiverObjectId],
        sanitizedMessage
      );
      console.log("New Message:", newMessage);

      await messageService.addMessageToConversation(
        conversation.id.toString(),
        newMessage._id
      );

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.status(200).json({
        status: "SUCCESS",
        message: "Message sent successfully",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        status: "FAILED",
        message: err.message,
      });
    }
  };
}

export function getMessages() {
  return async function (
    req: IGetUserAuthInfoRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id: userToChat } = req.params;
      const userToChatId = new Types.ObjectId(userToChat);

      const sender = req.user?._id.toString();
      const senderId = new Types.ObjectId(sender);

      if (!senderId) {
        res.status(400).json({ message: "Sender ID is missing" });
        return;
      }

      const conversation = await messageService.findConversation([
        senderId,
        userToChatId,
      ]);

      if (!conversation) {
        res.status(200).json([]);
        return;
      }

      await conversation.populate("messages");

      const messages = conversation.messages;

      res.status(200).json(messages);
    } catch (error) {
      const errs = error as Error;
      res.status(500).json({ message: errs.message });
    }
  };
}
