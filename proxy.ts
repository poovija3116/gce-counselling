import { auth } from "@/auth"
import { NextResponse } from "next/server"
// let's use next-auth's middleware functionality
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  // Define protected routes
  const isStudentRoute = pathname.startsWith('/student') && !pathname.includes('/login')
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.includes('/login')
  const isCounsellorRoute = pathname.startsWith('/counsellor') && !pathname.includes('/login')

  if (!isLoggedIn && (isStudentRoute || isAdminRoute || isCounsellorRoute)) {
    // Redirect to respective login pages
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login?role=admin', req.url))
    }
    if (pathname.startsWith('/counsellor')) {
      return NextResponse.redirect(new URL('/login?role=counsellor', req.url))
    }
    return NextResponse.redirect(new URL('/login?role=student', req.url))
  }

  // Check roles
  if (isLoggedIn) {
    if (isStudentRoute && role !== 'student') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    if (isCounsellorRoute && role !== 'counsellor') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
