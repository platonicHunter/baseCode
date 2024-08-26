import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start a new in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // If there's already a connection, disconnect it before connecting to the new URI
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Connect to the new in-memory MongoDB server
  await mongoose.connect(uri);

  console.log('Connected to new MongoDB instance for testing');
});

afterAll(async () => {
  // Disconnect and stop the MongoDB server after all tests
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Disconnected and stopped in-memory MongoDB');
});

beforeEach(async () => {
  // Clear the database before each test
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
    console.log('Dropped database before each test');
  }
});
