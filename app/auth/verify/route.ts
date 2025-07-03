import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
})

export async function GET(request: Request) {
  try {
    // Rate limit check
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    await limiter.check(3, identifier) // 3 verification attempts per hour per IP

    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    
    if (!code) {
      console.error('No verification code provided')
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Verification error:', error.message)
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    // Get session to confirm verification with timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
    )
    
    const result = await Promise.race([sessionPromise, timeoutPromise]);

    if (
      typeof result === 'object' &&
      result !== null &&
      'data' in result &&
      typeof (result as any).data === 'object' &&
      (result as any).data !== null &&
      'session' in (result as any).data
    ) {
      const session = (result as any).data.session;
      if (!session?.user) {
        console.error('No session after verification');
        return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
      }

      // Log successful verification with additional security context
      await supabase.from('auth_logs').insert({
        event: 'email_verified',
        user_id: session.user.id,
        user_agent: request.headers.get('user-agent'),
        ip: identifier,
        security_context: {
          verification_type: type,
          browser: request.headers.get('sec-ch-ua'),
          platform: request.headers.get('sec-ch-ua-platform')
        }
      });

      return NextResponse.redirect(new URL('/dashboard/time', request.url));
    } else {
      console.error('Session fetch failed or timed out');
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
    }
  } catch (error) {
    console.error('Verification process error:', error)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }
} 