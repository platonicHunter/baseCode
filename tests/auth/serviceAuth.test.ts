import { UserService } from '../../src/Services/UserService';
import { UserWriteRepository } from '../../src/Repositories/User/UserWriteRepository';
import { INotificationInterface } from '../../src/Services/NotificationService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Mock the dependencies
jest.mock('../../src/Repositories/User/UserReadRepository');
jest.mock('../../src/Repositories/User/UserWriteRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Dummy user data
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'User Test Example',
  email: 'testexample@gmail.com',
  password: 'hashed_password',
  emailVerified: true,
  verificationToken: 'some-token',
  refreshToken: null,
  isLogin: false,
  createdAt: new Date(),
  expiresAt: new Date(),
};

const mockUserReadRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockUserWriteRepository = {
  update: jest.fn(),
};

const mockNotificationService: INotificationInterface = {
  sendNotification: jest.fn(),
  sendEmailVerification: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(
      mockUserReadRepository as any,
      mockUserWriteRepository as any,
      mockNotificationService as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully with correct credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockUserReadRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.authenticateUser({
        email: 'testexample@gmail.com',
        password: 'Passw0rd!',
      });

      expect(result).toEqual(mockUser);
      expect(mockUserReadRepository.findByEmail).toHaveBeenCalledWith('testexample@gmail.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Passw0rd!', mockUser.password);
    });

    it('should throw an error if user email not found', async () => {
        (mockUserReadRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      
        await expect(userService.authenticateUser({
          email: 'nonexistent@example.com',
          password: 'Passw0rd!',
        })).rejects.toThrow('User not found');
      
        expect(mockUserReadRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      });
      

    it('should return null if password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (mockUserReadRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.authenticateUser({
        email: 'testexample@gmail.com',
        password: 'WrongPassword!',
      });

      expect(result).toBeNull();
      expect(mockUserReadRepository.findByEmail).toHaveBeenCalledWith('testexample@gmail.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword!', mockUser.password);
    });
  });

  describe('verifyUserEmail', () => {
    it('should verify user email if the token is valid and user exists', async () => {
      const token = 'valid_token';
      const userId = mockUser._id.toString();
      const decoded = { id: userId };
  
      // Mock implementations
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (mockUserReadRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockUserWriteRepository.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: true,
      });
  
      const result = await userService.verifyUserEmail(token);
  
      expect(result).toBe(true);
      expect(mockUserReadRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserWriteRepository.update).toHaveBeenCalledWith(userId, { ...mockUser, emailVerified: true });
    });
  
    it('should throw error if token is invalid or expired', async () => {
      const token = 'invalid_token';
  
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid or expired token'); });
  
      await expect(userService.verifyUserEmail(token)).rejects.toThrow('Invalid or expired verification token');
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET as string);
    });
  
    it('should throw error if user is not found', async () => {
      const token = 'valid_token';
      const userId = mockUser._id.toString();
      const decoded = { id: userId };
  
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (mockUserReadRepository.findById as jest.Mock).mockResolvedValue(null);
  
      await expect(userService.verifyUserEmail(token)).rejects.toThrow('User not found');
      expect(mockUserReadRepository.findById).toHaveBeenCalledWith(userId);
    });
  
    it('should throw error if updating the user fails', async () => {
      const token = 'valid_token';
      const userId = mockUser._id.toString();
      const decoded = { id: userId };
  
      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      (mockUserReadRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockUserWriteRepository.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
  
      await expect(userService.verifyUserEmail(token)).rejects.toThrow('Update failed');
      expect(mockUserReadRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserWriteRepository.update).toHaveBeenCalledWith(userId, { ...mockUser, emailVerified: true });
    });
  });
});
