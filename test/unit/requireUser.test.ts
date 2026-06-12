import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockCookies, mockSessionFindUnique, mockUserFindUnique } = vi.hoisted(
  () => ({
    mockCookies: vi.fn(),
    mockSessionFindUnique: vi.fn(),
    mockUserFindUnique: vi.fn(),
  })
)

vi.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}))

vi.mock("@/lib/db", () => ({
  prisma: {
    session: { findUnique: mockSessionFindUnique },
    user: { findUnique: mockUserFindUnique },
  },
}))

import { requireUser } from "@/lib/session"

const sampleUser = {
  id: "user-1",
  email: "user@example.com",
  passwordHash: "hash",
  createdAt: new Date("2025-01-01"),
}

function mockSessionCookie(value: string | undefined) {
  mockCookies.mockResolvedValue({
    get: vi.fn().mockImplementation((name: string) => {
      if (name === "session" && value !== undefined) {
        return { value }
      }
      return undefined
    }),
  })
}

function mockValidSession() {
  mockSessionCookie("sess-1")
  mockSessionFindUnique.mockResolvedValue({
    id: "sess-1",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date("2025-01-01"),
  })
  mockUserFindUnique.mockResolvedValue(sampleUser)
}

describe("requireUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    })
  })

  it("returns 401 when there is no session cookie", async () => {
    const result = await requireUser()

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    expect(await (result as NextResponse).json()).toEqual({
      error: "Unauthorized",
    })
  })

  it("returns 401 when the session is expired", async () => {
    mockSessionCookie("sess-expired")
    mockSessionFindUnique.mockResolvedValue({
      id: "sess-expired",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date("2025-01-01"),
    })

    const result = await requireUser()

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    expect(await (result as NextResponse).json()).toEqual({
      error: "Unauthorized",
    })
  })

  it("returns 401 when the session user no longer exists", async () => {
    mockSessionCookie("sess-1")
    mockSessionFindUnique.mockResolvedValue({
      id: "sess-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date("2025-01-01"),
    })
    mockUserFindUnique.mockResolvedValue(null)

    const result = await requireUser()

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    expect(await (result as NextResponse).json()).toEqual({
      error: "Unauthorized",
    })
  })

  it("returns the user when the session is valid", async () => {
    mockValidSession()

    const result = await requireUser()

    expect(result).toEqual(sampleUser)
    expect(result).not.toBeInstanceOf(NextResponse)
  })
})
