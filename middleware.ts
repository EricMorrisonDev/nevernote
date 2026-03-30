import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "session"

const LOGIN_PATH = "/login"

// set up function for checking if the request url is a login path.
// check if it matches or starts with the login path
function isLoginPath(pathname: string) {
  return pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)
}

// set up middleware logic
export function middleware(request: NextRequest) {

//   destructure pathname from request url
  const { pathname } = request.nextUrl

//   get the session cookie from the request
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value

//   if the pathname is a login path and there is a cookie, redirect to '/'
//   otherwise just go next
  if (isLoginPath(pathname)) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

//   if the pathname is not a login path and there is no cookie, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

//   if all checks pass then just go next
  return NextResponse.next()
}

/**
 * Run on page routes only — not on `/api/*` (handlers use `requireUser` etc.).
 * Skips Next internals and common static assets.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
