import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

mongoose.connect(MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

export async function makeDb(): Promise<mongoose.Connection> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }
  return mongoose.connection;
}
