import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/time'
  const type = searchParams.get('type')
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Auth error:', error.message)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  // Handle password reset flow
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password/update', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
} 