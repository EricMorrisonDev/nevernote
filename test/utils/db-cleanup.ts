import { prisma } from "./prisma"

export async function clearDb() {
  await prisma.session.deleteMany()
  await prisma.note.deleteMany()
  await prisma.notebook.deleteMany()
  await prisma.stack.deleteMany()
  await prisma.user.deleteMany()
}
