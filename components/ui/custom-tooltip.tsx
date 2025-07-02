"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface CustomTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  onSubmit?: (data: { hours: string; description: string }) => void
  hasEntries?: boolean
}

export function CustomTooltip({ children, content, className, onSubmit, hasEntries }: CustomTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hours, setHours] = React.useState("")
  const [description, setDescription] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ hours, description })
    setIsOpen(false)
    setHours("")
    setDescription("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        {hasEntries ? (
          <div className="space-y-4">
            {content}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Enter hours worked"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter work description"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Entry
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 