import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { format } from 'date-fns'

export type Employee = Database['public']['Tables']['employees']['Row']

const supabase = createClientComponentClient<Database>()

export const employeeService = {
  async getCurrentEmployee() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  },

  async updateEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { user_id, created_at, updated_at, ...updateData } = employeeData

    // Format date fields with proper PostgreSQL timestamp format
    const formattedData = {
      ...updateData,
      hourly_rate: updateData.hourly_rate ? parseFloat(updateData.hourly_rate.toString()) : null,
      overtime_rate: updateData.overtime_rate ? parseFloat(updateData.overtime_rate.toString()) : null,
      hire_date: updateData.hire_date ? format(new Date(updateData.hire_date), 'yyyy-MM-dd HH:mm:ss') : null,
      date_of_birth: updateData.date_of_birth ? format(new Date(updateData.date_of_birth), 'yyyy-MM-dd HH:mm:ss') : null,
      updated_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }

    // First check if employee exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select()
      .eq('user_id', user.id)
      .single()

    let result;
    
    if (!existingEmployee) {
      // Insert new employee
      result = await supabase
        .from('employees')
        .insert({
          ...formattedData,
          user_id: user.id,
          created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        })
        .select()
        .single()
    } else {
      // Update existing employee
      result = await supabase
        .from('employees')
        .update(formattedData)
        .eq('user_id', user.id)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Update error:', result.error)
      throw result.error
    }

    return result.data
  }
} 