import jwt from "jsonwebtoken";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "..";

export function generateJwtToken(userId: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const payload = { id: userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1hr" });
}

export function verifyJwtToken({ token }: { token: string }): any {
  try {
    if (!JWT_SECRET) {
      throw new Error("No token provided");
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT", decoded);
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired data");
  }
}

export function generateAccessToken(userId: string): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not provided");
  }
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string): string {
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}
