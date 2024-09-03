import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel, IUser } from "../../../src/models/User/User.model";
import { UserReadRepository } from "../../../src/Repositories/User/UserReadRepository";

let mongoServer: MongoMemoryServer;
const repository = new UserReadRepository();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Optionally, set up specific data or collections here
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

describe('UserReadRepository', () => {
  test('findByEmail should return a user by email', async () => {
    const email = "test@example.com";
    const mockUser: IUser = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email,
      password: 'password123',
      emailVerified: false,
      verificationToken: 'token',
      refreshToken: null,
      isLogin: false,
      createdAt: new Date()
    });

    await mockUser.save();

    const result = await repository.findByEmail(email);
    expect(result).toEqual(expect.objectContaining({
      _id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password,
      emailVerified: mockUser.emailVerified,
      verificationToken: mockUser.verificationToken,
      refreshToken: mockUser.refreshToken,
      isLogin: mockUser.isLogin,
      createdAt: mockUser.createdAt
    }));
  });

  test('findByName should return a user by name', async () => {
    const name = "Test User";
    const mockUser: IUser = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      name,
      email: 'test@example.com',
      password: 'password123',
      emailVerified: false,
      verificationToken: 'token',
      refreshToken: null,
      isLogin: false,
      createdAt: new Date()
    });

    await mockUser.save();

    const result = await repository.findByName(name);
    expect(result).toEqual(expect.objectContaining({
      _id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password,
      emailVerified: mockUser.emailVerified,
      verificationToken: mockUser.verificationToken,
      refreshToken: mockUser.refreshToken,
      isLogin: mockUser.isLogin,
      createdAt: mockUser.createdAt
    }));
  });

  test('findByVerificationTokenAndUserId should return a user by verification token and user ID', async () => {
    const token = "verificationToken";
    const userId = new mongoose.Types.ObjectId();
    const mockUser: IUser = new UserModel({
      _id: userId,
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      emailVerified: false,
      verificationToken: token,
      refreshToken: null,
      isLogin: false,
      createdAt: new Date()
    });

    await mockUser.save();

    const result = await repository.findByVerificationTokenAndUserId(token, userId.toString());
    expect(result).toEqual(expect.objectContaining({
      _id: mockUser._id,
      email: mockUser.email,
      name: mockUser.name,
      password: mockUser.password,
      emailVerified: mockUser.emailVerified,
      verificationToken: mockUser.verificationToken,
      refreshToken: mockUser.refreshToken,
      isLogin: mockUser.isLogin,
      createdAt: mockUser.createdAt
    }));
  });
});
