import { Types } from "mongoose";
import ConversationModel, {
  IConversation,
} from "../../../src/models/Message/Conversation.model";
import { ConversationReadRepository } from "../../../src/Repositories/Message/ConversationReadRepository";

jest.mock("../../../src/models/Message/Conversation.model");

describe("ConversationReadRepository", () => {
  let conversationReadRepository: ConversationReadRepository;
  
  beforeEach(() => {
    // Initialize the repository before each test
    conversationReadRepository = new ConversationReadRepository();
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  it("should find a conversation by participants", async () => {
    // Arrange
    const senderId = new Types.ObjectId();
    const receiverId = new Types.ObjectId();
    const mockConversation: IConversation = {
      participants: [senderId, receiverId],
      _id: new Types.ObjectId(),
      // Add other necessary fields here
    } as IConversation;

    // Mock the findOne method to return a mock query with an exec method
    (ConversationModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockConversation),
    });

    // Act
    const result = await conversationReadRepository.findConversation([senderId, receiverId]);

    // Assert
    expect(ConversationModel.findOne).toHaveBeenCalledWith({
      participants: [senderId, receiverId],
    });
    expect(result).toEqual(mockConversation);
  });

  it("should return null if no conversation is found", async () => {
    // Arrange
    const senderId = new Types.ObjectId();
    const receiverId = new Types.ObjectId();

    // Mock the findOne method to return a mock query with an exec method
    (ConversationModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    // Act
    const result = await conversationReadRepository.findConversation([senderId, receiverId]);

    // Assert
    expect(ConversationModel.findOne).toHaveBeenCalledWith({
      participants: [senderId, receiverId],
    });
    expect(result).toBeNull();
  });
});
