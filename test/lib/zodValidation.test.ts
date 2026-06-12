import { NextResponse } from "next/server"
import { flattenError, z } from "zod"
import { describe, expect, it } from "vitest"

import { requireValidation } from "@/lib/zodValidation"
import { createNoteSchema } from "@/lib/validations/notes"

const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
  count: z.number().int().positive(),
})

describe("requireValidation", () => {
  it("returns parsed data on valid input", () => {
    const result = requireValidation(testSchema, { name: "alpha", count: 3 })

    expect(result).not.toBeInstanceOf(NextResponse)
    if (result instanceof NextResponse) {
      throw new Error("expected parse result")
    }

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: "alpha", count: 3 })
  })

  it("returns 400 with flattened validation details on invalid input", async () => {
    const input = { name: "", count: -1 }
    const parsed = testSchema.safeParse(input)
    expect(parsed.success).toBe(false)

    const result = requireValidation(testSchema, input)

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(400)
    await expect((result as NextResponse).json()).resolves.toEqual({
      error: "Validation failed",
      details: flattenError(parsed.error),
    })
  })

  it("returns 400 when required fields are missing", async () => {
    const result = requireValidation(createNoteSchema, { title: "Only title" })

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(400)
    const body = await (result as NextResponse).json()
    expect(body.error).toBe("Validation failed")
    expect(body.details).toBeDefined()
  })

  it("accepts valid input for app schemas such as createNoteSchema", () => {
    const result = requireValidation(createNoteSchema, {
      title: "Note",
      content: "Body",
      notebookId: "nb-1",
    })

    expect(result).not.toBeInstanceOf(NextResponse)
    if (result instanceof NextResponse) {
      throw new Error("expected parse result")
    }

    expect(result.data).toEqual({
      title: "Note",
      content: "Body",
      notebookId: "nb-1",
    })
  })
})
