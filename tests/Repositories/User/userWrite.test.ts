import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel, IUser } from "../../../src/models/User/User.model";
import { UserWriteRepository } from "../../../src/Repositories/User/UserWriteRepository";
import { CreateUserInput } from "../../../src/types/User/IUserRegisterInterface";
import bcrypt from 'bcryptjs';
import { generateJwtToken } from "../../../src/config/token/token";

// Mock functions
jest.mock('bcryptjs');
jest.mock('../../../src/config/token/token');

let mongoServer: MongoMemoryServer;
let repository: UserWriteRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  repository = new UserWriteRepository();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe('UserWriteRepository', () => {
  it('createUser should hash password and create a new user', async () => {
    const userInput: CreateUserInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (generateJwtToken as jest.Mock).mockReturnValue('jwt_token');

    const savedUser = await repository.createUser(userInput);

    expect(savedUser).toHaveProperty('name', userInput.name);
    expect(savedUser).toHaveProperty('email', userInput.email);
    expect(savedUser.password).not.toBe(userInput.password); 
    expect(savedUser).toHaveProperty('verificationToken', 'jwt_token');
  });

  test('update should return null for a non-existing user', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = { name: 'Non-Existent User' };

    const result = await repository.update(nonExistentId, updateData);

    expect(result).toBeNull();
  });

  it('delete should return false for non-existing user', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const result = await repository.delete(nonExistentId);
    expect(result).toBe(false);
  });
});
