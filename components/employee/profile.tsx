"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { employeeService } from "@/services/employee-service"
import { motion } from "framer-motion"
import { User, Pencil, Save, Mail, Phone, MapPin, Building2, Calendar, BankNote } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UNSTABLE_REVALIDATE_RENAME_ERROR } from "next/dist/lib/constants"

export function EmployeeProfile() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    status: "Active",
    hourly_rate: "",
    overtime_rate: "",
    hire_date: "",
    date_of_birth: "",
    national_insurance: "",
    bank_account: "",
    created_at: "",
    updated_at: ""
  })

  useEffect(() => {
    async function loadEmployee() {
      const data = await employeeService.getCurrentEmployee()
      setEmployee(data)
      if (data) {
        setFormData({
          user_id: data.user_id || "",
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          department: data.department || "",
          position: data.position || "",
          status: data.status || "Active",
          hourly_rate: data.hourly_rate?.toString() || "",
          overtime_rate: data.overtime_rate?.toString() || "",
          hire_date: data.hire_date || "",
          date_of_birth: data.date_of_birth || "",
          national_insurance: data.national_insurance || "",
          bank_account: data.bank_account || "",
          created_at: data.created_at || "",
          updated_at: data.updated_at || ""
        })
      }
    }
    loadEmployee()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        department: formData.department,
        position: formData.position,
        status: formData.status,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        overtime_rate: formData.overtime_rate ? parseFloat(formData.overtime_rate) : null,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : null,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : null,
        national_insurance: formData.national_insurance,
        bank_account_details: formData.bank_account
      }

      const updatedEmployee = await employeeService.updateEmployee(updateData)
      setEmployee(updatedEmployee)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your employee profile has been updated successfully."
      })
    } catch (error) {
      console.error('Error updating employee:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Employee Profile</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <Save className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hourly Rate (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Overtime Rate (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overtime_rate}
                  onChange={(e) => setFormData({ ...formData, overtime_rate: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hire Date</label>
                <Input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">National Insurance Number</label>
                <Input
                  value={formData.national_insurance}
                  onChange={(e) => setFormData({ ...formData, national_insurance: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Account</label>
                <Input
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
            {isEditing && (
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}