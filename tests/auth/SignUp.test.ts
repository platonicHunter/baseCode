import request from 'supertest';
import { app } from '../../src/server';
import { isValidEmail, isValidName, isValidPassword } from '../../src/controllers/Auth/sign-up';
import { userService } from '../../src/controllers/Auth/login';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Signup Controller Integration Tests', () => {

  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  it('should return 400 if validation errors exist', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test Example',
        email: 'invalidemail',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  it('should return 200 and create a user if all inputs are valid', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test Example',
        email: 'test@example.com',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'SUCCESS');
    expect(response.body).toHaveProperty('message', 'User created successfully');
  });

  it('should return 400 if any required input is missing', async () => {
    let response = await request(app)
      .post('/api/user/register')
      .send({
        email: 'test@example.com',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'FAILED');
    expect(response.body).toHaveProperty('message', 'You must fill in all the inputs');
  });

  it('should return 400 if passwords do not match', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test Example',
        email: 'test@example.com',
        password: 'Passw0rd!',
        confirmPassword: 'DifferentPassw0rd!',
      });
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'FAILED');
    expect(response.body).toHaveProperty('message', 'Passwords do not match');
  });

  it('should return 400 if the name is invalid or does not meet the required format', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test',
        email: 'test@example.com',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      });
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'FAILED');
    expect(response.body).toHaveProperty('message', 'Name is invalid or does not meet the required format. Required: at least 3 words');
  });

  it('should return 400 with validation errors for invalid email', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test Example',
        email: 'invalidemail',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      });

    expect(response.status).toBe(400);

    // Check if the errors array is present in the response body
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'body',
          msg: 'Invalid value',
          path: 'email',
          value: 'invalidemail'
        })
      ])
    );
  });
  

  it('should return 400 if the password does not meet the required format', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test Example',
        email: 'test@example.com',
        password: 'Password',
        confirmPassword: 'Password',
      });
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'FAILED');
    expect(response.body).toHaveProperty('message', 'Password must be at least 6 characters long, include at least one capital letter and one special character');
  });

  it('should return 500 if createUser throws an error', async () => {
    const createUserMock = jest.spyOn(userService, 'createUser').mockImplementation(() => {
      throw new Error('Testing error');
    });

    const response = await request(app)
      .post('/api/user/register')
      .send({
        name: 'User Test Example',
        email: 'test@example.com',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'FAILED');
    expect(response.body).toHaveProperty('message', 'Testing error');

    createUserMock.mockRestore();
  });

  describe("check input functions", () => {
    it("should return true for valid name", () => {
      expect(isValidName("Lu Min Aung")).toBe(true);
      expect(isValidName("Htoo Myat Naing")).toBe(true);
    });

    it("should return false for invalid name", () => {
      expect(isValidName("")).toBe(false);
      expect(isValidName("H")).toBe(false); 
    });

    it("should return true for valid email", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("valid.email@domain.co")).toBe(true);
    });

    it("should return false for invalid email", () => {
      expect(isValidEmail("invalidemail")).toBe(false);
      expect(isValidEmail("another@invalid")).toBe(false);
    });

    it("should return true for valid password", () => {
      expect(isValidPassword("Password1!")).toBe(true);
      expect(isValidPassword("AnotherPassword2@")).toBe(true);
    });

    it("should return false for invalid password", () => {
      expect(isValidPassword("short")).toBe(false);
      expect(isValidPassword("withoutnumber")).toBe(false);
    });
  });
});
