import { NewPassword } from "@/components/auth/new-password"

export default function ResetPasswordPage({
  params: { token },
}: {
  params: { token: string }
}) {
  return <NewPassword token={token} />
} 