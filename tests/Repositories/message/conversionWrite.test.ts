import { Types } from "mongoose";
import ConversationModel, { IConversation } from "../../../src/models/Message/Conversation.model";
import { ConversationWriteRepository } from "../../../src/Repositories/Message/ConversationWriteRepository";

jest.mock("../../../src/models/Message/Conversation.model");

describe("ConversationWriteRepository", () => {
  let conversationWriteRepository: ConversationWriteRepository;

  const participants = [new Types.ObjectId(), new Types.ObjectId()] as [Types.ObjectId, Types.ObjectId];
  const messages = [new Types.ObjectId(), new Types.ObjectId()];

  beforeEach(() => {
    conversationWriteRepository = new ConversationWriteRepository();
  });

  it("should create a new conversation with participants and messages", async () => {
    const mockConversation: Partial<IConversation> = {
      _id: new Types.ObjectId(),
      participants,
      messages,
    };

    // Mock the `create` method from `BaseWriteRepository`
    const createSpy = jest.spyOn(conversationWriteRepository, "create").mockResolvedValueOnce(mockConversation as IConversation);

    // Call the method
    const result = await conversationWriteRepository.createConversation(participants, messages);

    expect(createSpy).toHaveBeenCalledWith({
      participants,
      messages,
    });
    expect(result).toEqual(mockConversation);
  });

  it("should create a conversation with participants and no messages", async () => {
    const mockConversation: Partial<IConversation> = {
      _id: new Types.ObjectId(),
      participants,
      messages: [],
    };

    const createSpy = jest.spyOn(conversationWriteRepository, "create").mockResolvedValueOnce(mockConversation as IConversation);

    const result = await conversationWriteRepository.createConversation(participants);

    expect(createSpy).toHaveBeenCalledWith({
      participants,
      messages: [],
    });
    expect(result).toEqual(mockConversation);
  });

  it("should throw an error if conversation creation fails", async () => {
    jest.spyOn(conversationWriteRepository, "create").mockRejectedValueOnce(new Error("Failed to create conversation"));

    await expect(
      conversationWriteRepository.createConversation(participants, messages)
    ).rejects.toThrow("Failed to create conversation");
  });
});
