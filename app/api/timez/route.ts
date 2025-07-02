import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.date || !data.start_time || !data.end_time) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'date, start_time, and end_time are required' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data: record, error } = await supabase
      .from('time_entries')
      .insert([{
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        break_time: parseInt(data.break_time) || 0,
        description: data.description || '',
        duration: data.duration,
        user_id: data.user_id,
        project_id: data.project_id
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(record, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add entry', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const entries = await getTimeEntries()
    return NextResponse.json(entries, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch entries', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 