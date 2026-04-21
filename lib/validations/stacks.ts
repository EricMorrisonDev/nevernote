import { z } from 'zod'

export const createStackSchema = z.object({
    title: z.string().trim().min(1),
    notebooks: z.
        array(z.string())
        .min(1, "Select at least one notebook")
})

export const updateStackSchema = z.object({
    title: z.string().trim().min(1)
})

export const stackIdParamsSchema = z.object({
    id: z.string()
})