import { JsonObject } from "@prisma/client/runtime/client"
import { NextResponse } from "next/server"
import { ZodType } from "zod"
import { flattenError } from "zod/v4/core"


export const requireValidation = async (schema: ZodType, input: JsonObject | string) => {
    const result = schema.safeParse(input)

    if(!result.success){
        return NextResponse.json(
            {error: "Validation failed", details: flattenError(result.error)},
            {status: 400}
        )
    }

    return result
}