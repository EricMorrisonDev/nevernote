import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { flattenError } from 'zod'
import { signupSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/db'

const SESSION_COOKIE_NAME = 'session'
const SESSION_MAX_AGE_DAYS = 30

export async function POST(request: Request) {
  try {
    // parse the request body then validate using zod schema
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    // if the body was not parsed successfully, return a next response with an error
    if(!parsed.success){
        return NextResponse.json(
            {error: "Failed to parse request", details: flattenError(parsed.error)},
            {status: 400}
        )
    }

    // extract email and password from parsed data then hash the password
    const { email, password } = parsed.data
    const passwordHash = await bcrypt.hash(password, 10)

    // run prisma query saving user with email and hashed pw stored in data obj
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash
        }
    })

    // create an expiresAt value by adding max age days value above to today's date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS)

    // run prisma query saving session with userId and expiresAt stored in data obj
    const session = await prisma.session.create({
        data: {
            userId: user.id,
            expiresAt
        }
    })

    // load cookie store in a const by awaiting cookies function
    const cookieStore = await cookies()

    // add new cookie for the new session to cookie store
    cookieStore.set(SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    })

    // return next response with id and email in body, and status code in options
    return NextResponse.json(
        {id: user.id, email: user.email},
        {status: 200}
    )
  } catch (e) {

    // if we catch an error, check if it is a prisma error indicating the email already exists
    const existing =
      e && typeof e === 'object' && 'code' in e && e.code === 'P2002'
    if (existing) {
    // if it's a prisma error code P2002 then the email already exists
    // return next response with error and status
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }
    throw e
  }
}
