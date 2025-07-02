import Airtable from 'airtable'

const PAT = 'patgkZRqgQ6KsiU0T'
const baseId = 'appk6UAjgMuYeq65q'

// Initialize Airtable with the Personal Access Token
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: PAT,
  requestTimeout: 30000 // 30 second timeout
})

const base = Airtable.base(baseId)
const table = base('Timez')

interface TimeEntryData {
  date: string
  clockIn: string
  clockOut: string
  breakTime: string | number
  duration?: string
}

export const getTimeEntries = async () => {
  try {
    const records = await table.select({
      maxRecords: 100,
      sort: [{ field: 'Date', direction: 'desc' }]
    }).firstPage()

    return records.map(record => ({
      id: record.id,
      fields: {
        Date: record.get('Date'),
        ClockIn: record.get('Clock In'),
        ClockOut: record.get('Clock Out'),
        BreakTime: record.get('Break Time'),
        Duration: record.get('Duration'),
        Status: record.get('Status')
      }
    }))
  } catch (error: any) {
    console.error('Airtable Error:', error)
    throw new Error(`Airtable error: ${error.message || 'Unknown error'}`)
  }
}

export const addTimeEntry = async (data: TimeEntryData) => {
  try {
    const records = await table.create([
      {
        fields: {
          Name: `Entry ${new Date().toISOString()}`,
          Notes: 'Time entry from app',
          Date: data.date,
          'Clock In': data.clockIn,
          'Clock Out': data.clockOut,
          'Break Time': typeof data.breakTime === 'string' ? parseInt(data.breakTime) : data.breakTime,
          Duration: data.duration || '00:00',
          Status: 'Active'
        }
      }
    ])

    return {
      id: records[0].id,
      fields: records[0].fields
    }
  } catch (error: any) {
    console.error('Airtable Error:', error)
    throw new Error(`Airtable error: ${error.message || 'Unknown error'}`)
  }
}