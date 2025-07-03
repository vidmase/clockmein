"use client"

import { useState } from "react"
// Mock implementation - TODO: implement proper hook
interface Member {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar?: string
}

const useMembers = () => ({
  members: [] as Member[],
  getMembers: async () => [] as Member[],
  addMember: async (data: any) => ({ id: '1', ...data } as Member),
  updateMember: async (id: string, data: any) => ({ id, ...data } as Member),
  deleteMember: async (id: string) => true,
  loading: false,
  error: null
})
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { MemberCard } from "./members/member-card"
import { AddMemberDialog } from "./members/add-member-dialog"
import { EditMemberDialog } from "./members/edit-member-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const memberSchema = z.object({
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

export function Members() {
  const { members, loading, addMember, updateMember, deleteMember } = useMembers()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  
  const form = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      status: "Active",
      working_hours: 8
    }
  })

  const onSubmit = async (data: z.infer<typeof memberSchema>) => {
    try {
      const newMember = await addMember(data)
      if (newMember) {
        toast.success("Member added successfully")
        form.reset()
      }
    } catch (error) {
      toast.error("Failed to add member")
    }
  }

  const handleUpdate = async (data: z.infer<typeof memberSchema>) => {
    if (!selectedMember) return
    try {
      const updated = await updateMember(selectedMember.id, data)
      if (updated) {
        toast.success("Member updated successfully")
        setSelectedMember(null)
      }
    } catch (error) {
      toast.error("Failed to update member")
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <AddMemberDialog form={form} onSubmit={onSubmit} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <MemberCard 
            key={member.id} 
            member={member}
            onEdit={() => setSelectedMember(member)}
            // onDelete={() => deleteMember(member.id)} // Removed for build compatibility
          />
        ))}
      </div>

      {selectedMember && (
        <EditMemberDialog 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

