import { Card, CardContent } from "./card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: any
  trend?: number
  color?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }: StatCardProps) {
  const colorVariants = {
    blue: "from-blue-500/10 to-transparent",
    indigo: "from-indigo-500/10 to-transparent",
    purple: "from-purple-500/10 to-transparent",
    violet: "from-violet-500/10 to-transparent",
    emerald: "from-emerald-500/10 to-transparent",
    orange: "from-orange-500/10 to-transparent"
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br opacity-50" 
             style={{ background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)` }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Icon className={`h-4 w-4 text-${color}-500`} />
            {title}
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
            {trend !== undefined && (
              <span className={cn(
                "text-xs font-medium",
                trend >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
} 