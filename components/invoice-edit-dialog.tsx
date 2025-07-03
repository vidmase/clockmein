import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
// Temporarily define Invoice interface - TODO: create proper types file
interface Invoice {
  id?: string
  invoice_number: string
  date: string
  client_name: string
  client_id?: string
  amount: number
  paid_amount?: number
  status: "Paid" | "Pending" | "Overdue"
  description?: string
  clients?: {
    email?: string
    phone?: string
    address?: string
    company?: string
  }
}
import { format } from "date-fns"
import { useEffect, useState } from "react"

// Temporarily define Client interface - TODO: create proper types file
interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
}

// Mock useClients hook - TODO: implement proper hook
const useClients = () => ({
  clients: [] as Client[],
  getClients: async () => [],
  isLoading: false,
  error: null
})

const editInvoiceFormSchema = z.object({
  date: z.string({
    required_error: "An invoice date is required.",
  }),
  client_id: z.string({
    required_error: "Please select a client.",
  }),
  amount: z.number({
    required_error: "Please enter the invoice amount.",
  }).positive(),
  paid_amount: z.number({
    required_error: "Please enter the paid amount.",
  }).min(0),
  status: z.enum(["Paid", "Pending", "Overdue"], {
    required_error: "Please select an invoice status.",
  }),
  description: z.string().optional()
})

interface InvoiceEditDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (invoice: Invoice, data: z.infer<typeof editInvoiceFormSchema>) => Promise<void>
}

export function InvoiceEditDialog({ invoice, open, onOpenChange, onSave }: InvoiceEditDialogProps) {
  const { getClients } = useClients()
  const [clients, setClients] = useState<Client[]>([])
  
  const form = useForm<z.infer<typeof editInvoiceFormSchema>>({
    resolver: zodResolver(editInvoiceFormSchema),
    defaultValues: {
      date: "",
      client_id: "",
      amount: 0,
      paid_amount: 0,
      status: "Pending",
      description: ""
    }
  })

  useEffect(() => {
    const loadClients = async () => {
      const data = await getClients()
      setClients(data)
    }
    loadClients()
  }, [getClients])

  useEffect(() => {
    if (invoice) {
      form.reset({
        date: format(new Date(invoice.date), "yyyy-MM-dd"),
        client_id: invoice.client_id,
        amount: invoice.amount,
        paid_amount: invoice.paid_amount || 0,
        status: invoice.status,
        description: invoice.description || ""
      })
    }
  }, [invoice, form])

  if (!invoice) return null

  const onSubmit = async (data: z.infer<typeof editInvoiceFormSchema>) => {
    await onSave(invoice, data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Invoice #{invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paid_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                  {form.watch('amount') > form.watch('paid_amount') && (
                    <p className="text-sm text-muted-foreground">
                      Remaining: £{(form.watch('amount') - form.watch('paid_amount')).toFixed(2)}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-between gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 