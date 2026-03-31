import type { Note, Notebook, Session, Stack, User } from "@prisma/client"
import { prisma } from "./prisma"

let seq = 0

function nextSeq() {
  seq += 1
  return seq
}

export async function createUser(overrides: Partial<User> = {}): Promise<User> {
  const n = nextSeq()
  return prisma.user.create({
    data: {
      email: overrides.email ?? `test-user-${n}@example.com`,
      passwordHash: overrides.passwordHash ?? "test-password-hash",
    },
  })
}

export async function createSession(
  userId: string,
  overrides: Partial<Session> = {}
): Promise<Session> {
  const now = new Date()
  return prisma.session.create({
    data: {
      userId,
      expiresAt:
        overrides.expiresAt ??
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  })
}

export async function createStack(
  userId: string,
  overrides: Partial<Stack> = {}
): Promise<Stack> {
  const n = nextSeq()
  return prisma.stack.create({
    data: {
      title: overrides.title ?? `Test Stack ${n}`,
      userId,
    },
  })
}

export async function createNotebook(
  userId: string,
  stackId?: string,
  overrides: Partial<Notebook> = {}
): Promise<Notebook> {
  const n = nextSeq()
  return prisma.notebook.create({
    data: {
      title: overrides.title ?? `Test Notebook ${n}`,
      userId,
      stackId: overrides.stackId ?? stackId,
    },
  })
}

export async function createNote(
  userId: string,
  notebookId?: string,
  overrides: Partial<Note> = {}
): Promise<Note> {
  const n = nextSeq()
  return prisma.note.create({
    data: {
      title: overrides.title ?? `Test Note ${n}`,
      content: overrides.content ?? `Test content ${n}`,
      userId,
      notebookId: overrides.notebookId ?? notebookId,
    },
  })
}
