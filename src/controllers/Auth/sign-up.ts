import { CreateUserInput } from "../../types/User/IUserRegisterInterface";
import { Request, Response } from "express";
import { userService } from "./login";
import { validationResult } from "express-validator";

export function isValidName(name: string): boolean {
  const nameWords = name.trim().split(/\s+/);
  return nameWords.length >= 3;
}

//set the email up to 3 words
export function isValidEmail(email: string): boolean {
  const emailWords = email.split(" ");
  return emailWords.length <= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//set the password to contain 1 capitalLetter, 1 specialCharater and at least 6 words
export function isValidPassword(password: string): boolean {
  const capitalLetter = /[A-Z]/;
  const specialCharacter = /[!@#$%^&*(),.?":{}|<>]/;
  return (
    capitalLetter.test(password) &&
    specialCharacter.test(password) &&
    password.length >= 6
  );
}

export default function makeSignup() {
  
  return async function signup(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const { name, email, password, confirmPassword } = req.body;
      console.log("Name", name);

      if (!name || !email || !password || !confirmPassword) {
        res.status(400).json({
          status: "FAILED",
          message: "You must fill in all the inputs",
        });
        return;
      }

      if (!isValidName(name)) {
        res.status(400).json({
          status: "FAILED",
          message:
            "Name is invalid or does not meet the required format. Required: at least 3 words",
        });
        return;
      }

      if (!isValidEmail(email)) {
        res.status(400).json({
          status: "FAILED",
          message: "Email is invalid or does not meet the required format",
        });
        return;
      }

      if (!isValidPassword(password)) {
        res.status(400).json({
          status: "FAILED",
          message:
            "Password must be at least 6 characters long, include at least one capital letter and one special character",
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          status: "FAILED",
          message: "Passwords do not match",
        });
        return;
      }

      const userInput: CreateUserInput = {
        name,
        email,
        password,
      };
      const user = await userService.createUser(userInput);

      res.status(200).json({
        status: "SUCCESS",
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        status: "FAILED",
        message: err.message,
      });
    }
  };
}
