import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
})

const SUPABASE_TIMEOUT = 15000 // 15 seconds timeout

export async function POST(req: Request) {
  try {
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous'
    await limiter.check(5, identifier)
    
    const { email } = await req.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Add timeout to the reset password request
    const resetPromise = supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/update`,
    })
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), SUPABASE_TIMEOUT)
    )

    const result = await Promise.race([resetPromise, timeoutPromise])
      .catch(error => ({ error }));

    if (typeof result === 'object' && result !== null && 'error' in result && result.error) {
      console.error('Reset password error:', result.error)
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Log reset attempt only if successful
    await supabase.from('auth_logs').insert({
      event: 'password_reset_requested',
      email,
      ip: identifier,
      user_agent: req.headers.get('user-agent'),
    })

    return NextResponse.json({ 
      message: "Reset link sent", 
      shouldRedirect: true 
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: "Failed to process reset request" },
      { status: 500 }
    )
  }
} 