if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing")

import { PrismaClient } from ".prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
