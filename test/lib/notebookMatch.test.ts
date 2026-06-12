import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockNotebookFindFirst } = vi.hoisted(() => ({
  mockNotebookFindFirst: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  prisma: {
    notebook: { findFirst: mockNotebookFindFirst },
  },
}))

import { ensureNotebookBelongsToUser } from "@/lib/notebookMatch"

describe("ensureNotebookBelongsToUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("queries prisma with notebook id and user id", async () => {
    mockNotebookFindFirst.mockResolvedValue({ id: "nb-1" })

    await ensureNotebookBelongsToUser("nb-1", "user-1")

    expect(mockNotebookFindFirst).toHaveBeenCalledWith({
      where: { id: "nb-1", userId: "user-1" },
    })
  })

  it("returns 400 when the notebook does not belong to the user", async () => {
    mockNotebookFindFirst.mockResolvedValue(null)

    const result = await ensureNotebookBelongsToUser("nb-1", "user-1")

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(400)
    await expect((result as NextResponse).json()).resolves.toEqual({
      error: "NotebookId does not match user",
    })
  })

  it("returns undefined when the notebook belongs to the user", async () => {
    mockNotebookFindFirst.mockResolvedValue({
      id: "nb-1",
      userId: "user-1",
    })

    const result = await ensureNotebookBelongsToUser("nb-1", "user-1")

    expect(result).toBeUndefined()
  })
})
