import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middlewares/auth'; // Adjust the import path as needed
import { JWT_SECRET } from '../../src/config';
import { Types } from 'mongoose';

// Mock jsonwebtoken module
jest.mock('jsonwebtoken');

// Ensure JWT_SECRET is defined
const jwtSecret = JWT_SECRET as string;

const app = express();
app.use(express.json());

// Mock middleware for user authentication
app.use(authenticateToken);

// Routes for testing
app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'Protected content' });
});

describe('authenticateToken Middleware', () => {
  const validToken = jwt.sign({ id: new Types.ObjectId().toString() }, jwtSecret, { expiresIn: '1h' });
  const invalidToken = 'invalid-token';

  beforeAll(() => {
    // Set up any necessary global mocks or configurations
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 with valid token', async () => {
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, { id: new Types.ObjectId().toString() });
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Protected content');
  });

  it('should return 401 if token is missing', async () => {
    const response = await request(app)
      .get('/protected');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Access Denied');
  });

  it('should return 403 if token is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.text).toBe("\"Token not valid\"");
  });

  it('should return 403 if token payload is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, { id: null });
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(403);
    expect(response.text).toBe("\"Token payload is invalid\"");
  });

  
});
