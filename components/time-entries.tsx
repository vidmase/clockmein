import { Clock, Coffee, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface TimeEntry {
  id: string
  date: string
  start_time: string
  end_time: string
  duration: string
  break_time: number
  project?: {
    name: string
    color: string
  }
  tags?: string[]
}

interface TimeEntriesProps {
  entries: TimeEntry[]
}

export function TimeEntries({ entries }: TimeEntriesProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3">
        {entries && entries.length > 0 ? (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              {/* Date row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-800">
                    {format(new Date(entry.date), 'dd-MM-yyyy')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(entry.date), 'EEEE')}
                  </span>
                </div>
              </div>
              
              {/* Time row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-gray-500">Start Time</div>
                    <div className="font-medium text-green-600">{entry.start_time}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-gray-500">End Time</div>
                    <div className="font-medium text-red-600">{entry.end_time}</div>
                  </div>
                </div>
              </div>
              
              {/* Stats row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-xs text-gray-500">Break</div>
                    <div className="font-medium">{entry.break_time}m</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-medium">{entry.duration}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No time entries found</p>
          </div>
        )}
      </div>
    </div>
  )
}

