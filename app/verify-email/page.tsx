export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-4xl mb-2">✉️</div>
          <h1 className="text-3xl font-bold tracking-tight">Check your inbox</h1>
          <p className="text-muted-foreground">
            We've sent you a verification email
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-lg border border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-2xl">
              <span>📧</span>
              <span className="animate-bounce">→</span>
              <span>✨</span>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Please check your email inbox and click the verification link to activate your account.
              </p>
              <div className="text-sm space-y-2 text-left bg-secondary/20 p-4 rounded-md">
                <p className="font-medium text-primary">What happens next:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Click the verification link in your email 🔗</li>
                  <li>Your account will be activated instantly ⚡</li>
                  <li>You'll be redirected to your dashboard 🎯</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder 📁
          </p>
          <div className="text-xs text-muted-foreground">
            You can close this window after verification
          </div>
        </div>
      </div>
    </div>
  )
} 