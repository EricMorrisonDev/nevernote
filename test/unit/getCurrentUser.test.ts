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

import { getCurrentUser } from "@/lib/session"

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

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    })
  })

  it("returns null when there is no session cookie", async () => {
    const result = await getCurrentUser()

    expect(result).toBeNull()
    expect(mockSessionFindUnique).not.toHaveBeenCalled()
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it("returns null when the session cookie is empty", async () => {
    mockSessionCookie("")

    const result = await getCurrentUser()

    expect(result).toBeNull()
    expect(mockSessionFindUnique).not.toHaveBeenCalled()
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it("returns null when the session is not found", async () => {
    mockSessionCookie("missing-session")
    mockSessionFindUnique.mockResolvedValue(null)

    const result = await getCurrentUser()

    expect(result).toBeNull()
    expect(mockSessionFindUnique).toHaveBeenCalledWith({
      where: { id: "missing-session" },
    })
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it("returns null when the session is expired", async () => {
    mockSessionCookie("sess-expired")
    mockSessionFindUnique.mockResolvedValue({
      id: "sess-expired",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date("2025-01-01"),
    })

    const result = await getCurrentUser()

    expect(result).toBeNull()
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it("returns null when the session user no longer exists", async () => {
    mockSessionCookie("sess-1")
    mockSessionFindUnique.mockResolvedValue({
      id: "sess-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date("2025-01-01"),
    })
    mockUserFindUnique.mockResolvedValue(null)

    const result = await getCurrentUser()

    expect(result).toBeNull()
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    })
  })

  it("returns the user when the session is valid", async () => {
    mockSessionCookie("sess-1")
    mockSessionFindUnique.mockResolvedValue({
      id: "sess-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date("2025-01-01"),
    })
    mockUserFindUnique.mockResolvedValue(sampleUser)

    const result = await getCurrentUser()

    expect(result).toEqual(sampleUser)
    expect(mockSessionFindUnique).toHaveBeenCalledWith({
      where: { id: "sess-1" },
    })
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    })
  })
})
