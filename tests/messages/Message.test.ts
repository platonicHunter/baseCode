import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { MessageService } from '../../src/Services/MessageService';
import { getReceiverSocketId, io } from '../../src/Socket/socket';
import { getMessages, sendMessage } from '../../src/controllers/Message/message';

jest.mock('../../src/Services/MessageService');
jest.mock('../../src/Socket/socket');

const mockGetReceiverSocketId = getReceiverSocketId as jest.MockedFunction<typeof getReceiverSocketId>;
const mockIo = io as jest.Mocked<typeof io>;
const mockMessageService = MessageService as jest.MockedClass<typeof MessageService>;

interface CustomRequest extends Request {
  user?: {
    _id: Types.ObjectId;
  };
}

describe('Message Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const req: CustomRequest = {
        params: { id: 'receiverId' },
        body: { message: 'Hello!' },
        user: { _id: new Types.ObjectId() }
      } as any;
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      const conversation = { id: new Types.ObjectId() };
      const newMessage = { _id: new Types.ObjectId(), message: 'Hello!' };

      mockMessageService.prototype.findConversation = jest.fn().mockResolvedValue(conversation);
      mockMessageService.prototype.createMessage = jest.fn().mockResolvedValue(newMessage);
      mockMessageService.prototype.addMessageToConversation = jest.fn();

      mockGetReceiverSocketId.mockReturnValue('socketId');
      mockIo.to = jest.fn().mockReturnThis();
      mockIo.emit = jest.fn();

      await sendMessage()(req, res);

      expect(mockMessageService.prototype.findConversation).toHaveBeenCalledWith(req.user!._id, req.params.id);
      expect(mockMessageService.prototype.createMessage).toHaveBeenCalledWith(req.user!._id, req.body.message);
      expect(mockMessageService.prototype.addMessageToConversation).toHaveBeenCalledWith(conversation.id, newMessage._id);
      expect(mockIo.to).toHaveBeenCalledWith('socketId');
      expect(mockIo.emit).toHaveBeenCalledWith('newMessage', newMessage);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'SUCCESS',
        message: 'Message sent successfully',
      });
    });

    it('should handle errors properly', async () => {
      const req: CustomRequest = {
        params: { id: 'receiverId' },
        body: { message: 'Hello!' },
        user: { _id: new Types.ObjectId() }
      } as any;
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Adjust the error message to match what your service might throw
      mockMessageService.prototype.findConversation = jest.fn().mockRejectedValue(new Error('input must be a 24 character hex string, 12 byte Uint8Array, or an integer'));

      await sendMessage()(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'FAILED',
        message: 'input must be a 24 character hex string, 12 byte Uint8Array, or an integer',
      });
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages successfully', async () => {
      const req: CustomRequest = {
        params: { id: 'userToChat' },
        user: { _id: new Types.ObjectId() }
      } as any;
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      const conversation = {
        populate: jest.fn().mockResolvedValue({
          messages: [{ message: 'Hello!' }]
        })
      };

      mockMessageService.prototype.findConversation = jest.fn().mockResolvedValue(conversation);

      await getMessages()(req, res);

      expect(mockMessageService.prototype.findConversation).toHaveBeenCalledWith(req.user!._id, req.params.id);
      expect(conversation.populate).toHaveBeenCalledWith('messages');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ message: 'Hello!' }]);
    });

    it('should handle errors properly', async () => {
      const req: CustomRequest = {
        params: { id: 'userToChat' },
        user: { _id: new Types.ObjectId() }
      } as any;
      const res: Response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Adjust the error message to match what your service might throw
      mockMessageService.prototype.findConversation = jest.fn().mockRejectedValue(new Error('input must be a 24 character hex string, 12 byte Uint8Array, or an integer'));

      await getMessages()(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'input must be a 24 character hex string, 12 byte Uint8Array, or an integer' });
    });
  });
});
