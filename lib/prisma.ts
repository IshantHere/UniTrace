import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.VERCEL_ENV
  );

  const rawUrl = process.env.DATABASE_URL;
  const isSqlite = !rawUrl || rawUrl.startsWith("file:");

  if (isServerless && isSqlite) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    // Copy bundled seed database to /tmp if it does not exist yet
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db"),
        path.join(__dirname, "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        "/var/task/prisma/dev.db",
        "/var/task/dev.db",
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            fs.chmodSync(tmpDbPath, 0o666);

            // Copy WAL/SHM companion files if present
            if (fs.existsSync(`${candidate}-wal`)) {
              fs.copyFileSync(`${candidate}-wal`, `${tmpDbPath}-wal`);
              fs.chmodSync(`${tmpDbPath}-wal`, 0o666);
            }
            if (fs.existsSync(`${candidate}-shm`)) {
              fs.copyFileSync(`${candidate}-shm`, `${tmpDbPath}-shm`);
              fs.chmodSync(`${tmpDbPath}-shm`, 0o666);
            }
            copied = true;
            console.log(`[UniTrace Prisma] Initialized writable database in /tmp from ${candidate}`);
            break;
          } catch (err) {
            console.error(`[UniTrace Prisma] Failed copying SQLite DB from ${candidate}:`, err);
          }
        }
      }

      if (!copied) {
        console.warn("[UniTrace Prisma] Warning: Bundled dev.db not found; /tmp/dev.db will be empty until migrated or seeded.");
      }
    }

    const dbUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = dbUrl;

    const client = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    globalForPrisma.prisma = client;
    return client;
  }

  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
