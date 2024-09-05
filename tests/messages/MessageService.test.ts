import { MessageService } from '../../src/Services/MessageService';
import { Types } from 'mongoose';
import { IConversation } from '../../src/models/Message/Conversation.model';
import { IMessage } from '../../src/models/Message/Message.model';

// Mock the repositories
const mockConversationReadRepository = {
  findConversation: jest.fn(),
  findById: jest.fn(),
};

const mockConversationWriteRepository = {
  createConversation: jest.fn(),
};

const mockMessageReadRepository = {
  
};

const mockMessageWriteRepository = {
  createMessage: jest.fn(),
};

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService(
      mockConversationReadRepository as any,
      mockConversationWriteRepository as any,
      mockMessageReadRepository as any,
      mockMessageWriteRepository as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const participants: [Types.ObjectId, Types.ObjectId] = [
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];
      const mockConversation = { _id: new Types.ObjectId(), participants, messages: [] } as unknown as IConversation;

      mockConversationWriteRepository.createConversation.mockResolvedValue(mockConversation);

      const result = await messageService.createConversation(participants);

      expect(result).toEqual(mockConversation);
      expect(mockConversationWriteRepository.createConversation).toHaveBeenCalledWith(participants, []);
    });
  });

  describe('findConversation', () => {
    it('should find an existing conversation', async () => {
      const participants: [Types.ObjectId, Types.ObjectId] = [
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];
      const mockConversation = { _id: new Types.ObjectId(), participants, messages: [] } as unknown as IConversation;

      mockConversationReadRepository.findConversation.mockResolvedValue(mockConversation);

      const result = await messageService.findConversation(participants);

      expect(result).toEqual(mockConversation);
      expect(mockConversationReadRepository.findConversation).toHaveBeenCalledWith(participants);
    });

    it('should create a new conversation if none exists', async () => {
      const participants: [Types.ObjectId, Types.ObjectId] = [
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];
      const mockConversation = { _id: new Types.ObjectId(), participants, messages: [] } as unknown as IConversation;

      mockConversationReadRepository.findConversation.mockResolvedValue(null);
      mockConversationWriteRepository.createConversation.mockResolvedValue(mockConversation);

      const result = await messageService.findConversation(participants);

      expect(result).toEqual(mockConversation);
      expect(mockConversationReadRepository.findConversation).toHaveBeenCalledWith(participants);
      expect(mockConversationWriteRepository.createConversation).toHaveBeenCalledWith(participants, []);
    });
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const participants: [Types.ObjectId, Types.ObjectId] = [
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];
      const message = "Hello, World!";
      const mockMessage = { _id: new Types.ObjectId(), senderId: participants[0], receiverId: participants[1], content: message } as unknown as IMessage;

      mockMessageWriteRepository.createMessage.mockResolvedValue(mockMessage);

      const result = await messageService.createMessage(participants, message);

      expect(result).toEqual(mockMessage._id);
      expect(mockMessageWriteRepository.createMessage).toHaveBeenCalledWith(participants[0], participants[1], message);
    });
  });

  describe('addMessageToConversation', () => {
    it('should add a message to an existing conversation', async () => {
      const conversationId = new Types.ObjectId();
      const messageId = new Types.ObjectId();
      const mockConversation = { _id: conversationId, messages: [], save: jest.fn() } as unknown as IConversation;

      mockConversationReadRepository.findById.mockResolvedValue(mockConversation);

      await messageService.addMessageToConversation(conversationId, messageId);

      expect(mockConversation.messages).toContain(messageId);
      expect(mockConversation.save).toHaveBeenCalled();
    });

    it('should throw an error if conversation not found', async () => {
      const conversationId = new Types.ObjectId();
      const messageId = new Types.ObjectId();

      mockConversationReadRepository.findById.mockResolvedValue(null);

      await expect(messageService.addMessageToConversation(conversationId, messageId))
        .rejects
        .toThrow('Conversation not found');
    });
  });
});
