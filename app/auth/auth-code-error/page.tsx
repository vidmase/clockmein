export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">
          We couldn't verify your email. This might be because:
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
          <li>The verification link is malformed</li>
          <li>You're using a different device or browser</li>
          <li>The session has expired</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          Please try requesting a new verification link.
        </p>
        <div className="space-x-4">
          <a 
            href="/login" 
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
          >
            Go to Login
          </a>
          <a 
            href="/signup" 
            className="inline-block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10"
          >
            Sign Up Again
          </a>
        </div>
      </div>
    </div>
  )
} 