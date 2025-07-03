import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface Invoice {
  invoice_number: string
  date: string
  client_name: string
  amount: number
  status: string
  description?: string
  clients?: {
    email?: string
    phone?: string
    address?: string
    company?: string
  }
}

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-500 text-white"
    case "Pending":
      return "bg-yellow-500 text-black"
    case "Overdue":
      return "bg-red-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export function InvoiceDetailsDialog({ invoice, open, onOpenChange }: InvoiceDetailsDialogProps) {
  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Invoice Number</h4>
              <p>{invoice.invoice_number}</p>
            </div>
            <div>
              <h4 className="font-semibold">Date</h4>
              <p>{invoice.date}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold">Client Details</h4>
            <div className="space-y-2 mt-2">
              <p>Name: {invoice.client_name}</p>
              {invoice.clients?.email && <p>Email: {invoice.clients.email}</p>}
              {invoice.clients?.phone && <p>Phone: {invoice.clients.phone}</p>}
              {invoice.clients?.address && <p>Address: {invoice.clients.address}</p>}
              {invoice.clients?.company && <p>Company: {invoice.clients.company}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Amount</h4>
            <p>£{invoice.amount.toFixed(2)}</p>
          </div>

          <div>
            <h4 className="font-semibold">Status</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>

          {invoice.description && (
            <div>
              <h4 className="font-semibold">Description</h4>
              <p>{invoice.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 