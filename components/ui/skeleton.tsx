import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
}

function Skeleton({
  className,
  delay = 0,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-700/50 transition-colors duration-200 hover:bg-gray-600/50",
        className
      )}
      style={{
        animationDelay: `${delay}ms`
      }}
      {...props}
    />
  )
}

export { Skeleton } 