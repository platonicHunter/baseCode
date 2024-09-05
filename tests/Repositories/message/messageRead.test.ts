import { Types } from "mongoose";
import { MessageReadRepository } from "../../../src/Repositories/Message/MessageReadRepository";
import MessageModel, { IMessage } from "../../../src/models/Message/Message.model";

jest.mock("../../../src/models/Message/Message.model");

describe("MessageReadRepository", () => {
  let messageReadRepository: MessageReadRepository;
  const senderId = new Types.ObjectId();
  const receiverId = new Types.ObjectId();

  beforeEach(() => {
    messageReadRepository = new MessageReadRepository();
  });

  it("should find messages between two participants", async () => {
    const mockMessage: Partial<IMessage> = {
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(),
      receiverId: new Types.ObjectId(),
      message: "Hello there!",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Declare and assign findOneSpy
    const findOneSpy = jest
      .spyOn(messageReadRepository, "findOne")
      .mockResolvedValueOnce(mockMessage as IMessage);

    const result = await messageReadRepository.findMessages([senderId, receiverId]);

    // Use the spy to ensure the method was called with the right arguments
    expect(findOneSpy).toHaveBeenCalledWith({ senderId, receiverId });
    expect(result).toEqual(mockMessage);
  });

  it("should throw an error if no messages are found", async () => {
    jest.spyOn(messageReadRepository, "findOne").mockResolvedValueOnce(null);

    await expect(
      messageReadRepository.findMessages([senderId, receiverId])
    ).rejects.toThrow("Messages are not found");
  });
});
