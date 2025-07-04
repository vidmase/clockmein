"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const editMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["Active", "Inactive", "On Leave"]),
  hourly_rate: z.number().min(0).optional(),
  working_hours: z.number().min(0).max(24).default(8)
})

interface EditMemberDialogProps {
  member: any
  onClose: () => void
  onUpdate: (data: z.infer<typeof editMemberSchema>) => Promise<void>
}

export function EditMemberDialog({ member, onClose, onUpdate }: EditMemberDialogProps) {
  const form = useForm({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      ...member
    }
  })

  const onSubmit = async (data: z.infer<typeof editMemberSchema>) => {
    try {
      // Update member logic here
      await onUpdate(data)
      toast.success("Member updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update member")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update member information below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Same form fields as AddMemberDialog */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 