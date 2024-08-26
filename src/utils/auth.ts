import bcrypt from "bcryptjs";

export async function comparePassword(
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, hashedPassword);
}
