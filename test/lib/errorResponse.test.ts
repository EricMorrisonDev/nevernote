import { NextResponse } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { handleApiError } from "@/lib/errorResponse"

describe("handleApiError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns 500 with a generic error message", async () => {
    const result = handleApiError(new Error("something broke"))

    expect(result).toBeInstanceOf(NextResponse)
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toEqual({
      error: "Unknown error occurred",
    })
  })

  it("logs the error to console.error", () => {
    const err = new Error("database timeout")

    handleApiError(err)

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(err)
  })

  it("handles non-Error thrown values", async () => {
    const result = handleApiError("unexpected failure")

    expect(console.error).toHaveBeenCalledWith("unexpected failure")
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toEqual({
      error: "Unknown error occurred",
    })
  })
})
