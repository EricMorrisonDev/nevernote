import { afterAll, afterEach } from "vitest"
import { clearDb } from "./utils/db-cleanup"
import { prisma } from "./utils/prisma"

afterEach(async (ctx) => {
  const file = ctx.task.file?.filepath ?? ""
  if (file.includes("test/unit/") || file.includes("test/lib/")) {
    return
  }
  await clearDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})
