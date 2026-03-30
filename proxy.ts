import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

const SESSION_COOKIE = "session"
const LOGIN_PATH = "/login"


function isLoginPath (pathname: string){
    return (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}`))
}

export function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(`${SESSION_COOKIE}`)?.value

  if(isLoginPath(pathname)){
    if(sessionCookie){
        return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if(!sessionCookie){
    return NextResponse.redirect(new URL(`${LOGIN_PATH}`, request.url))
  }


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
