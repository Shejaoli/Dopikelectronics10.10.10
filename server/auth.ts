import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(password: string, hashed: string) {
  const [hash, salt] = hashed.split(".");
  const hashBuf = Buffer.from(hash, "hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuf, buf);
}
