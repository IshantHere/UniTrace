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

    // Copy bundled seed database to /tmp if it does not exist or is empty
    let needsCopy = true;
    try {
      if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 0) {
        needsCopy = false;
      }
    } catch {
      needsCopy = true;
    }

    if (needsCopy) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db"),
        path.join(__dirname, "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "..", "..", "prisma", "dev.db"),
        "/var/task/prisma/dev.db",
        "/var/task/dev.db",
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
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
            console.log(`[UniTrace Prisma] Initialized writable database in /tmp from ${candidate} (${fs.statSync(tmpDbPath).size} bytes)`);
            break;
          } catch (err) {
            console.error(`[UniTrace Prisma] Failed copying SQLite DB from ${candidate}:`, err);
          }
        }
      }

      // Deep directory search fallback if not found in candidate paths
      if (!copied) {
        try {
          const findDb = (dir: string, depth = 0): string | null => {
            if (depth > 3) return null;
            if (!fs.existsSync(dir)) return null;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const full = path.join(dir, entry.name);
              if (entry.isFile() && entry.name === "dev.db" && fs.statSync(full).size > 0) {
                return full;
              }
              if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
                const found = findDb(full, depth + 1);
                if (found) return found;
              }
            }
            return null;
          };

          const found = findDb(process.cwd()) || findDb("/var/task");
          if (found) {
            fs.copyFileSync(found, tmpDbPath);
            fs.chmodSync(tmpDbPath, 0o666);
            copied = true;
            console.log(`[UniTrace Prisma] Located and copied SQLite DB via deep search from ${found}`);
          }
        } catch (searchErr) {
          console.error("[UniTrace Prisma] Deep search for dev.db encountered error:", searchErr);
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
