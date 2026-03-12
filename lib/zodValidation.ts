import { ZodType, flattenError } from "zod";
import { NextResponse } from "next/server";

export function requireValidation<T>(schema: ZodType<T>, input: unknown) {

    const result = schema.safeParse(input)

    if(!result.success){
        return NextResponse.json(
            {error: "Validation failed", details: flattenError(result.error)},
            {status: 400}
        )
    }

    return result
}