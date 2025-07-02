import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { calculateHoursFromDuration } from '@/lib/time-calculations'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
  fontWeight: 300
})

interface TimeEntry {
  id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  description: string
  duration: string
  break_time: number
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Roboto',
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 40,
    paddingBottom: 30,
    marginBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1.2
  },
  subtitle: {
    fontSize: 12,
    color: '#93c5fd',
    marginTop: 4
  },
  reportInfo: {
    alignItems: 'flex-end'
  },
  section: {
    marginHorizontal: 40,
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 12,
    marginBottom: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    paddingHorizontal: 16
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: '#1e293b'
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    paddingHorizontal: 16
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    color: '#93c5fd',
    fontSize: 10
  },
  decorativeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#1e3a8a'
  }
})

interface TimesheetPDFTemplateProps {
  timeEntries: TimeEntry[]
  dateRange: {
    from: Date
    to: Date
  }
}

export function TimesheetPDFTemplate({ timeEntries, dateRange }: TimesheetPDFTemplateProps) {
  const totalHours = timeEntries
    .reduce((total, entry) => total + calculateHoursFromDuration(entry.duration), 0)
    .toFixed(2)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              
              <View>
                <Text style={styles.title}>Time Report</Text>
                <Text style={styles.subtitle}>Vidmantas Daugvila</Text>
              </View>
            </View>
            
            <View style={styles.reportInfo}>
              <Text style={styles.subtitle}>Report Period:</Text>
              <Text style={[styles.subtitle, { fontSize: 14, marginTop: 2 }]}>
                {format(dateRange.from, 'dd MMM yyyy')} - {format(dateRange.to, 'dd MMM yyyy')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>Date</Text>
            <Text style={[styles.cell, styles.headerCell]}>Start Time</Text>
            <Text style={[styles.cell, styles.headerCell]}>End Time</Text>
            <Text style={[styles.cell, styles.headerCell]}>Break</Text>
            <Text style={[styles.cell, styles.headerCell]}>Duration</Text>
          </View>
          
          {timeEntries.map((entry, index) => (
            <View key={index} style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc' }
            ]}>
              <Text style={styles.cell}>{format(new Date(entry.date), 'dd MMM yyy')}</Text>
              <Text style={styles.cell}>{entry.start_time}</Text>
              <Text style={styles.cell}>{entry.end_time}</Text>
              <Text style={styles.cell}>{entry.break_time}m</Text>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>{entry.duration}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={[styles.cell, { fontWeight: 'bold' }]}></Text>
            <Text style={[styles.cell, { fontWeight: 'bold' }]}></Text>
            <Text style={[styles.cell, { fontWeight: 'bold' }]}></Text>
            <Text style={[styles.cell, { fontWeight: 'bold' }]}>Total Hours:</Text>
            <Text style={[styles.cell, { fontWeight: 'bold', color: '#1e40af' }]}>{totalHours}h</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by ClockMeIn on {format(new Date(), 'PPP')}</Text>
          <Text style={styles.footerText}>Page 1 of 1</Text>
        </View>
        <View style={styles.decorativeBar} />
      </Page>
    </Document>
  )
} 