import mongoose from "mongoose";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthenticateUserInput {
  email: string;
  password: string;
}
