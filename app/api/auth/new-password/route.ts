import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from "zod"

const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 401 }
      )
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) throw error

    // Log successful password reset
    await supabase.from('auth_logs').insert({
      event: 'password_reset_completed',
      user_id: session.user.id,
      ip: req.headers.get('x-forwarded-for') || 'anonymous',
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