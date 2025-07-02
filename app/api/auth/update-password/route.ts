import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { passwordSchema } from '@/lib/schemas/auth'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
})

export async function POST(req: Request) {
  try {
    const identifier = req.headers.get('x-forwarded-for') || 'anonymous'
    await limiter.check(5, identifier) // 5 attempts per hour

    const { password } = await req.json()
    
    const result = passwordSchema.safeParse(password)
    if (!result.success) {
      return NextResponse.json(
        { error: "Password does not meet security requirements" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 401 }
      )
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error

    await supabase.from('auth_logs').insert({
      event: 'password_reset_completed',
      user_id: session.user.id,
      ip: identifier,
      user_agent: req.headers.get('user-agent'),
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
} 