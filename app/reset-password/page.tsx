'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ResetPassword } from '@/components/auth/reset-password'

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ResetPassword />
    </div>
  )
} //Comment: Reset password page component using the ResetPassword form component