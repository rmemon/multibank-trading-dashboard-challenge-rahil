import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { MockUserRecord } from "./mockUsers.js";
import { findUserByEmail } from "./mockUsers.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-in-production";

/** Default access-token lifetime (override with `JWT_EXPIRES_IN`, e.g. `15m`, `1h`). */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export async function validateCredentials(
  email: string,
  password: string,
): Promise<MockUserRecord | null> {
  const user = findUserByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  return match ? user : null;
}

export function signAccessToken(user: MockUserRecord): string {
  const payload: AccessTokenPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & AccessTokenPayload;
  if (typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: decoded.sub, email: decoded.email };
}
