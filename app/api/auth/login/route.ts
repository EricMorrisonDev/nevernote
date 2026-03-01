import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { flattenError } from 'zod'
import { loginSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/db'

const SESSION_COOKIE_NAME = 'session'
const SESSION_MAX_AGE_DAYS = 30

export async function POST (request: Request) {

    try{
        // parse request body and validate
        const body = await request.json()
        const validated = loginSchema.safeParse(body)

        // if validation fails, return NextResponse with error
        if(!validated.success){
            return NextResponse.json(
                {error: "Failed to parse request", details: flattenError(validated.error)},
                {status: 400}
            )
        }

        // extract email and password from validated body
        const { email, password } = validated.data

        // use email to run prisma query and see if user exists with that email
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        // if email is not registered, return NextResponse with an error
        if(!existingUser){
            return NextResponse.json(
                {error: "User not found"},
                {status: 400}
            )
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash)

        if(!passwordMatch){
            return NextResponse.json(
                {error: "Invalid credentials"},
                {status: 400}
            )
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS)

        const session = await prisma.session.create({
            data: {
                userId: existingUser.id,
                expiresAt
            } 
        })

        const cookieStore = await cookies()

        cookieStore.set(SESSION_COOKIE_NAME, session.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
          })

        return NextResponse.json(
            {id: existingUser.id, email: existingUser.email},
            {status: 200}
        )
        
    } catch (e) {
        throw e
    }
}