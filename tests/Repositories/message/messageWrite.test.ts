import { Types } from "mongoose";
import { MessageWriteRepository } from "../../../src/Repositories/Message/MessageWriteRepository";
import MessageModel, { IMessage } from "../../../src/models/Message/Message.model";

jest.mock("../../../src/models/Message/Message.model"); 

describe("MessageWriteRepository", () => {
  let messageWriteRepository: MessageWriteRepository;

  const senderId = new Types.ObjectId();
  const receiverId = new Types.ObjectId();
  const messageContent = "Hello!";

  beforeEach(() => {
    messageWriteRepository = new MessageWriteRepository();
  });

  it("should create a new message between two participants", async () => {
    const mockMessage: Partial<IMessage> = {
      _id: new Types.ObjectId(),
      senderId,
      receiverId,
      message: messageContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock the `save` method of the `MessageModel` prototype
    const saveMock = jest.spyOn(MessageModel.prototype, "save").mockResolvedValueOnce(mockMessage as IMessage);

    // Execute the `createMessage` function
    const result = await messageWriteRepository.createMessage(senderId, receiverId, messageContent);

    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual(mockMessage);
  });

  it("should throw an error if message creation fails", async () => {
    // Mock the `save` method to throw an error
    jest.spyOn(MessageModel.prototype, "save").mockRejectedValueOnce(new Error("Failed to create message"));

    await expect(
      messageWriteRepository.createMessage(senderId, receiverId, messageContent)
    ).rejects.toThrow("Failed to create message");
  });
});
