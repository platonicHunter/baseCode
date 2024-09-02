// testSetup.ts
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server';

let mongoServer: MongoMemoryServer;
let server: any;
const port = process.env.TEST_PORT || 3001; // Default to 3001 if TEST_PORT is not set

export const startServer = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);

  server = app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
  });
};

export const stopServer = async (): Promise<void> => {
  if (server) {
    server.close();
  }

  await mongoose.disconnect();
  await mongoServer.stop();
};

export const resetDatabase = async (): Promise<void> => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
};
