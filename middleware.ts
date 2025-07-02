import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const requestUrl = new URL(req.url)
  const accessToken = requestUrl.hash.match(/access_token=([^&]*)/)?.[1]
  
  if (accessToken) {
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: requestUrl.hash.match(/refresh_token=([^&]*)/)?.[1] || '',
    })
    
    if (!error && session) {
      return NextResponse.redirect(new URL('/reset-password/update', req.url))
    }
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    res.cookies.set('lastPath', req.nextUrl.pathname, {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/projects/:path*',
    '/team/:path*',
    '/settings/:path*',
    '/reset-password/:path*'
  ]
}