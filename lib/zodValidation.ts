import { NextResponse } from "next/server"
import { ZodType } from "zod"
import { flattenError } from "zod/v4/core"


export function requireValidation<T>(schema: ZodType<T>, input: unknown) {
    const result = schema.safeParse(input)

    if (!result.success) {
        return NextResponse.json(
            { error: "Validation failed", details: flattenError(result.error) },
            { status: 400 }
        )
    }

    return result
}