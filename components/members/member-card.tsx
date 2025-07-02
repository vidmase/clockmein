"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Mail, Phone, MapPin, Clock, Calendar, Briefcase, 
  MoreVertical, Activity, TrendingUp 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

const getStatusColor = (status: string) => ({
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  'On Leave': 'bg-yellow-100 text-yellow-800'
}[status] || 'bg-gray-100 text-gray-800')

export function MemberCard({ member, stats, onEdit }) {
  const [showStats, setShowStats] = useState(false)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="relative">
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowStats(!showStats)}>
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.role}</p>
            <Badge className={`mt-2 ${getStatusColor(member.status)}`}>
              {member.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{member.location}</span>
            </div>
          )}
        </div>

        {showStats && stats && (
          <div className="pt-4 space-y-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Productivity</span>
                  <span className="text-sm font-medium">{Math.round(stats.averageDaily * 100 / member.working_hours)}%</span>
                </div>
                <Progress 
                  value={stats.averageDaily * 100 / member.working_hours} 
                  className="h-1.5" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.projectCount} Active Projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.totalHours.toFixed(1)}h Total</span>
                </div>
              </div>
            </div>
            
            {stats.lastActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last active: {format(stats.lastActive, 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 