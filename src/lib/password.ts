import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) {
    return false;
  }

  const [salt, expectedHash] = storedHash.split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const expected = Buffer.from(expectedHash, "hex");
  const actual = scryptSync(password, salt, expected.length);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
