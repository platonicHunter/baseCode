import request from 'supertest';
import express from 'express';
import { sendMessage, getMessages } from '../../src/controllers/Message/message';
import { MessageService } from '../../src/Services/MessageService';
import { Types } from 'mongoose';

// Mock dependencies
jest.mock('../../src/Services/MessageService');

const app = express();
app.use(express.json());

// Middleware for token validation
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ status: 'FAILED', message: 'Forbidden' });
  }
  const token = authHeader.split(' ')[1];
  if (token === 'invalid-token') {
    return res.status(403).json({ status: 'FAILED', message: 'Forbidden' });
  }
  req.user = { _id: new Types.ObjectId() };
  next();
};

app.use(mockAuthMiddleware);
app.post('/api/messages/send/:id', sendMessage());
app.get('/api/messages/:id', getMessages());

// Initialize mock service instance
const MockMessageService = MessageService as jest.MockedClass<typeof MessageService>;
let mockReceiverId: Types.ObjectId;
let server: any;

describe('Message Controller Tests', () => {
  let messageService: MessageService;

  beforeAll((done) => {
    server = app.listen(0, () => { 
      done();
    });
  });

  beforeEach(() => {
    messageService = new MockMessageService(
      {} as any, // Mock IReadConversationInterface
      {} as any, // Mock IWriteConversationInterface
      {} as any, // Mock IReadMessageInterface
      {} as any  // Mock IWriteMessageInterface
    );
    jest.clearAllMocks();
    mockReceiverId = new Types.ObjectId();
  });

  afterAll(() => {
    if (server) server.close();
  });

  describe('sendMessage', () => {
    it('sendMessage - success', async () => {
      const mockMessageId = new Types.ObjectId();
      const mockConversation = { id: new Types.ObjectId(), messages: [mockMessageId] };
  
      MockMessageService.prototype.findConversation.mockResolvedValue({
        id: mockConversation.id,
        messages: mockConversation.messages,
      } as any);
  
      MockMessageService.prototype.createMessage.mockResolvedValue({ _id: mockMessageId } as any);
      MockMessageService.prototype.addMessageToConversation.mockResolvedValue(undefined);
  
      const response = await request(app)
        .post(`/api/messages/send/${mockReceiverId}`)
        .set('Authorization', `Bearer valid-token`) // Ensure the token is valid
        .send({ message: 'Hello' });
  
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('SUCCESS');
      expect(response.body.message).toBe('Message sent successfully');
      expect(MockMessageService.prototype.createMessage).toHaveBeenCalledWith(
        [expect.any(Types.ObjectId), mockReceiverId], 'Hello'
      );
    });
  
    it('sendMessage - failure due to database error', async () => {
      MockMessageService.prototype.findConversation.mockRejectedValue(new Error('Database error'));
  
      const response = await request(app)
        .post(`/api/messages/send/${mockReceiverId}`)
        .set('Authorization', `Bearer valid-token`)
        .send({ message: 'Hello' });
  
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('FAILED');
      expect(response.body.message).toBe('Database error');
    });
  
    it('sendMessage - unauthorized (invalid token)', async () => {
      const response = await request(app)
        .post(`/api/messages/send/${mockReceiverId}`)
        .set('Authorization', `Bearer invalid-token`)
        .send({ message: 'Hello' });
  
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('FAILED');
      expect(response.body.message).toBe('Forbidden');
    });
  
    it('sendMessage - unauthorized (missing token)', async () => {
      const response = await request(app)
        .post(`/api/messages/send/${mockReceiverId}`)
        .send({ message: 'Hello' });
  
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('FAILED');
      expect(response.body.message).toBe('Forbidden');
    });

  })
 

  describe('getMessages', () => {
    it('getMessages - success', async () => {
      const mockConversation = {
        messages: [{ _id: mockReceiverId.toHexString(), text: 'Hello' }],
        populate: jest.fn().mockReturnThis() // Mock the populate method
      };
    
      // Mock the service method
      MockMessageService.prototype.findConversation.mockResolvedValue(mockConversation as any);
    
      // Perform the request
      const response = await request(app)
        .get(`/api/messages/${mockReceiverId}`)
        .set('Authorization', `Bearer valid-token`);
    
      // Debugging output
      console.log('Response Status:', response.status);
      console.log('Response Body:', response.body);
    
      // Validate response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockConversation.messages);
    });
    
    
  
    it('getMessages - failure due to database error', async () => {
      MockMessageService.prototype.findConversation.mockRejectedValue(new Error('Database error'));
  
      const response = await request(app)
        .get(`/api/messages/${mockReceiverId}`)
        .set('Authorization', `Bearer valid-token`);
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  
    it('getMessages - unauthorized (invalid token)', async () => {
      const response = await request(app)
        .get(`/api/messages/${mockReceiverId}`)
        .set('Authorization', `Bearer invalid-token`);
  
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('FAILED');
      expect(response.body.message).toBe('Forbidden');
    });
  
    it('getMessages - unauthorized (missing token)', async () => {
      const response = await request(app)
        .get(`/api/messages/${mockReceiverId}`)
        .send();
  
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('FAILED');
      expect(response.body.message).toBe('Forbidden');
    });
  })
 
});
