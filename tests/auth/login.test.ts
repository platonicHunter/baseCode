import { Request, Response } from "express";
import makeLogin, { userService, userWriteRepository } from "../../src/controllers/Auth/login";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { IUser } from "../../src/models/User/User.model";
import jwt from 'jsonwebtoken';

// Mock the dependencies
jest.mock('../../src/Services/UserService', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    authenticateUser: jest.fn().mockImplementation((input) => {
      const { email, password } = input;
      if (email === 'testexample@gmail.com' && password === 'Passw0rd!') {
        return Promise.resolve({
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
        } as IUser);
      }
      return Promise.resolve(null);
    }),
  })),
}));

jest.mock('../../src/Repositories/User/UserWriteRepository', () => ({
  UserWriteRepository: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockImplementation((id, user) => {
      return Promise.resolve({
        ...user,
        isLogin: true,
      });
    }),
  })),
}));

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('Login Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const generateToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  };

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      headers: {
        authorization: `Bearer ${generateToken('test_user_id')}`,
      },
      body: {
        email: 'testexample@gmail.com',
        password: 'Passw0rd!',
      },
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if validation errors exist', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: 'Invalid email format' }],
    });

    const login = makeLogin();
    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      errors: [{ msg: 'Invalid email format' }],
    });
  });

  it('should return 200 and authenticate a user if credentials are correct', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    const mockUpdate = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: 'User Test Example',
      email: 'testexample@gmail.com',
      password: 'hashed_password',
      emailVerified: true,
      verificationToken: 'some-token',
      refreshToken: null,
      isLogin: true,
      createdAt: new Date(),
      expiresAt: new Date(),
    } as IUser);

    (userService.authenticateUser as jest.Mock).mockResolvedValueOnce({
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
    } as IUser);

    (userWriteRepository.update as jest.Mock).mockImplementation(mockUpdate);

    const login = makeLogin();

    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'SUCCESS',
      message: 'User authenticated successfully',
      data: expect.objectContaining({
        _id: expect.any(mongoose.Types.ObjectId),
        name: 'User Test Example',
        email: 'testexample@gmail.com',
        password: 'hashed_password',
        emailVerified: true,
        verificationToken: 'some-token',
        refreshToken: null,
        isLogin: true,
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      }),
    });

  });

  it('should return 400 if the user is not found or the password is incorrect', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    req.body.email = 'wrongaccount@gmail.com';
    req.body.password = 'Passw0rd!';
    const login = makeLogin();
    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'FAILED',
      message: 'User not found or password is incorrect',
    });
  });

  it('should return 400 if email or password is missing', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    req.body.email = '';
    req.body.password = '';
    const login = makeLogin();
    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'FAILED',
      message: 'Email and password are required',
    });
  });

  it('should return 400 if the email is invalid', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    req.body.email = 'testexamplegmail.com';
    const login = makeLogin();
    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'FAILED',
      message: 'User not found or password is incorrect',
    });
  });

  it('should return 400 if the password is incorrect', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    req.body.password = 'wrongPassword';
    const login = makeLogin();
    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'FAILED',
      message: 'User not found or password is incorrect',
    });
  });

  it('should return 500 if there is an internal server error', async () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });

    (userService.authenticateUser as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    const login = makeLogin();
    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'FAILED',
      message: 'Database error',
    });
  });
});
