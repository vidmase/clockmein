"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, PlusCircle, FileText, DollarSign, UserCheck, ChevronDown, Search } from 'lucide-react'
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Pagination } from "@/components/ui/pagination"
// Mock implementations - TODO: implement proper hooks and components
const useInvoices = () => ({
  getInvoices: async () => [],
  createInvoice: async (data: any) => ({ id: '1', ...data }),
  deleteInvoice: async (id: string) => true,
  updateInvoice: async (id: string, data: any) => ({ id, ...data })
})

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
}

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

const useClients = () => ({
  getClients: async () => [] as Client[],
  clients: [] as Client[],
  isLoading: false,
  error: null
})

// Mock components - TODO: implement proper components
const InvoiceDetailsDialog = ({ invoice, open, onOpenChange }: any) => null
const InvoiceEditDialog = ({ invoice, open, onOpenChange, onSave }: any) => null
const PDFDownloadLink = ({ children, ...props }: { children: ((params: { loading: boolean; error: boolean }) => React.ReactNode) | React.ReactNode; [key: string]: any }) => 
  <div>{typeof children === 'function' ? children({ loading: false, error: false }) : children}</div>
const InvoicePDFTemplate = ({ invoice }: any) => null

// Mock data for demonstration
const mockInvoices = [
  { id: 1, date: "2023-05-01", client: "TechCorp", amount: 5000.00, status: "Paid" },
  { id: 2, date: "2023-05-10", client: "DesignHub", amount: 3500.00, status: "Pending" },
  { id: 3, date: "2023-05-15", client: "MarketPro", amount: 7500.00, status: "Overdue" },
  { id: 4, date: "2023-05-20", client: "DevSolutions", amount: 6000.00, status: "Paid" },
  { id: 5, date: "2023-05-25", client: "CreativeMinds", amount: 4500.00, status: "Pending" },
]

const invoiceFormSchema = z.object({
  date: z.date({
    required_error: "An invoice date is required.",
  }),
  client_id: z.string({
    required_error: "Please select a client.",
  }),
  amount: z.number({
    required_error: "Please enter the invoice amount.",
  }).positive(),
  status: z.enum(["Paid", "Pending", "Overdue"], {
    required_error: "Please select an invoice status.",
  }),
  description: z.string().optional()
})

export function Invoices() {
  const { getInvoices, createInvoice, deleteInvoice, updateInvoice } = useInvoices()
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [status, setStatus] = useState<string>("all")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null)
  const { getClients } = useClients()
  const [clients, setClients] = useState<Client[]>([])

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      date: new Date(),
      client_id: '',
      amount: 0,
      status: 'Pending' as const,
      description: ''
    }
  })

  useEffect(() => {
    const loadInvoices = async () => {
      const data = await getInvoices()
      setInvoices(data)
      setIsLoading(false)
    }
    loadInvoices()
  }, [getInvoices])

  useEffect(() => {
    const loadClients = async () => {
      const data = await getClients()
      setClients(data)
    }
    loadClients()
  }, [getClients])

  const onSubmit = async (data: z.infer<typeof invoiceFormSchema>) => {
    try {
      const newInvoice = await createInvoice({
        date: format(data.date, "yyyy-MM-dd"),
        client_id: data.client_id,
        amount: data.amount,
        status: data.status,
        description: data.description
      })

      if (newInvoice) {
        setInvoices(prev => [...prev, newInvoice])
        form.reset({
          date: new Date(),
          client_id: '',
          amount: 0,
          status: 'Pending',
          description: ''
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const searchedInvoices = invoices.filter((invoice) => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      invoice.client_name.toLowerCase().includes(searchTerm) ||
      invoice.invoice_number.toString().includes(searchTerm)
    )
  })

  const filteredInvoices = searchedInvoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.date)
    return (
      (!date?.from || invoiceDate >= date.from) &&
      (!date?.to || invoiceDate <= date.to) &&
      (status === "all" || invoice.status === status)
    )
  })

  const pageCount = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)

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

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!invoice.id) return
    const success = await deleteInvoice(invoice.id)
    if (success) {
      setInvoices(prev => prev.filter(i => i.id !== invoice.id))
    }
    setIsDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  const handleEditInvoice = async (invoice: Invoice, data: z.infer<typeof invoiceFormSchema>) => {
    if (!invoice.id) return
    const updatedInvoice = await updateInvoice(invoice.id, {
      date: format(data.date, "yyyy-MM-dd"),
      client_id: data.client_id,
      amount: data.amount,
      status: data.status,
      description: data.description
    })

    if (updatedInvoice) {
      setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-700">Invoices</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoiced
            </CardTitle>
            <DollarSign className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalAmount.toFixed(2)}</div>
            <p className="text-xs opacity-70">
              for the selected period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Remaining
            </CardTitle>
            <DollarSign className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{filteredInvoices.reduce((sum, invoice) => {
                const remaining = invoice.amount - (invoice.paid_amount || 0);
                return sum + remaining;
              }, 0).toFixed(2)}
            </div>
            <p className="text-xs opacity-70">
              unpaid balance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paid Invoices
            </CardTitle>
            <UserCheck className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInvoices.filter(i => i.status === "Paid").length}
            </div>
            <p className="text-xs opacity-70">
              invoices paid
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <FileText className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInvoices.filter(i => i.status === "Pending").length}
            </div>
            <p className="text-xs opacity-70">
              invoices pending
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-400 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Invoices
            </CardTitle>
            <CalendarIcon className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInvoices.filter(i => i.status === "Overdue").length}
            </div>
            <p className="text-xs opacity-70">
              invoices overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-indigo-700">Invoice Entries</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new invoice.
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
                            <Input type="date" {...field} value={field.value ? format(field.value, "yyyy-MM-dd") : ""} onChange={e => field.onChange(new Date(e.target.value))} />
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
                              {clients && clients.map((client) => (
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
                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <DialogFooter>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        Create Invoice
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            A breakdown of your invoices for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client or invoice #"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.client_name}</TableCell>
                  <TableCell>£{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedInvoice(invoice)
                          setIsDetailsOpen(true)
                        }}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setInvoiceToEdit(invoice)
                          setIsEditDialogOpen(true)
                        }}>
                          Edit invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <PDFDownloadLink
                            document={<InvoicePDFTemplate invoice={invoice} />}
                            fileName={`invoice-${invoice.invoice_number}.pdf`}
                            className="flex w-full items-center"
                          >
                            {({ loading, error }) => (
                              <>
                                {loading ? (
                                  <span className="mr-2">Loading...</span>
                                ) : (
                                  <FileText className="mr-2 h-4 w-4" />
                                )}
                                {error ? 'Error' : 'Download PDF'}
                              </>
                            )}
                          </PDFDownloadLink>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setInvoiceToDelete(invoice)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          Delete invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={pageCount}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-100">Export to CSV</Button>
          <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-100">Print Report</Button>
        </CardFooter>
      </Card>
      <InvoiceDetailsDialog 
        invoice={selectedInvoice}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice #{invoiceToDelete?.invoice_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => invoiceToDelete && handleDeleteInvoice(invoiceToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <InvoiceEditDialog 
        invoice={invoiceToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditInvoice}
      />
    </div>
  )
}

