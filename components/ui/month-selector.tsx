import { format, subMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MonthSelectorProps {
  value: Date
  onValueChange: (date: Date) => void
}

export function MonthSelector({ value, onValueChange }: MonthSelectorProps) {
  // Generate last 12 months including current month
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: `${date.getFullYear()}-${date.getMonth()}`,
      label: format(date, 'MMMM yyyy'),
      date: date
    };
  });

  const currentValue = `${value.getFullYear()}-${value.getMonth()}`;

  return (
    <Select
      value={currentValue}
      onValueChange={(newValue) => {
        const selectedMonth = months.find(m => m.value === newValue);
        if (selectedMonth) {
          onValueChange(selectedMonth.date);
        }
      }}
    >
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 