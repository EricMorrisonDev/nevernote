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
})
