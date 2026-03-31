import { afterAll, afterEach } from "vitest"
import { clearDb } from "./utils/db-cleanup"
import { prisma } from "./utils/prisma"

afterEach(async () => {
  await clearDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})
