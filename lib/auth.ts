import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "./constants";

const COOKIE = "unitrace_session";
const ttl = 60 * 60 * 24 * 14; // 14 days
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      tokenHash: hash(token),
      userId,
      expiresAt: new Date(Date.now() + ttl * 1000),
    },
  });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttl,
  });
}

export async function destroySession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hash(token) },
    });
  }
  cookies().delete(COOKIE);
}

export async function getCurrentUser() {
  try {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({
      where: { tokenHash: hash(token) },
      include: {
        user: {
          include: {
            institution: true,
          },
        },
      },
    });
    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      return null;
    }
    return session.user;
  } catch (error) {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function requireRole(user: { role: string }, roles: Role[]) {
  const normalizedRole = user.role as Role;
  if (!roles.includes(normalizedRole)) {
    throw new Error("FORBIDDEN");
  }
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, stored: string) => bcrypt.compare(password, stored);
export { COOKIE };
