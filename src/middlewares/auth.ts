import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Types } from "mongoose";
import { IGetUserAuthInfoRequest } from "../controllers/Message/message";

export function authenticateToken(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  console.log("Authorization header:", req.header("Authorization"));
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    console.error("No token provided");
    return res.status(401).send("Access Denied");
  }

  if (!JWT_SECRET) {
    throw new Error("No JWT_SECRET provided");
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json("Token not valid");
    }

    if (decoded && decoded.id) {
      req.user = { _id: new Types.ObjectId(decoded.id) };
      console.log("User authenticated:", req.user);
      return next();
    } else {
      console.error("Invalid token payload");
      return res.status(403).json("Token payload is invalid");
    }
  });
}
