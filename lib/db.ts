import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const { PrismaClient } = require("@prisma/client");

const sqliteUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });

const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
