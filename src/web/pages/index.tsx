import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  customer: string;
  company: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "partial";
  daysPastDue: number;
  lastContact: string;
  contactMethod: "email" | "phone" | "none";
}

const invoices: Invoice[] = [
  {
    id: "INV-2024-001",
    customer: "Sarah Mitchell",
    company: "TechCorp Solutions",
    amount: 12500.0,
    dueDate: "2024-01-15",
    status: "overdue",
    daysPastDue: 22,
    lastContact: "2 days ago",
    contactMethod: "email",
  },
  {
    id: "INV-2024-002",
    customer: "Michael Chen",
    company: "DataFlow Inc",
    amount: 8750.5,
    dueDate: "2024-02-01",
    status: "pending",
    daysPastDue: 0,
    lastContact: "5 days ago",
    contactMethod: "phone",
  },
  {
    id: "INV-2024-003",
    customer: "Emily Rodriguez",
    company: "CloudNine Systems",
    amount: 24000.0,
    dueDate: "2024-01-28",
    status: "partial",
    daysPastDue: 9,
    lastContact: "1 day ago",
    contactMethod: "email",
  },
  {
    id: "INV-2024-004",
    customer: "James Wilson",
    company: "Nexus Dynamics",
    amount: 5200.0,
    dueDate: "2024-01-20",
    status: "paid",
    daysPastDue: 0,
    lastContact: "Today",
    contactMethod: "email",
  },
  {
    id: "INV-2024-005",
    customer: "Lisa Thompson",
    company: "Quantum Labs",
    amount: 18900.0,
    dueDate: "2024-01-10",
    status: "overdue",
    daysPastDue: 27,
    lastContact: "1 week ago",
    contactMethod: "phone",
  },
  {
    id: "INV-2024-006",
    customer: "Robert Kim",
    company: "Apex Industries",
    amount: 31250.0,
    dueDate: "2024-02-15",
    status: "pending",
    daysPastDue: 0,
    lastContact: "3 days ago",
    contactMethod: "none",
  },
  {
    id: "INV-2024-007",
    customer: "Amanda Foster",
    company: "Stellar Ventures",
    amount: 7800.0,
    dueDate: "2024-01-25",
    status: "overdue",
    daysPastDue: 12,
    lastContact: "4 days ago",
    contactMethod: "email",
  },
  {
    id: "INV-2024-008",
    customer: "David Park",
    company: "Innovate Co",
    amount: 15600.0,
    dueDate: "2024-02-10",
    status: "pending",
    daysPastDue: 0,
    lastContact: "Yesterday",
    contactMethod: "phone",
  },
];

const statusConfig = {
  paid: {
    label: "Paid",
    variant: "default" as const,
    icon: CheckCircle2,
    className: "bg-fintech-success/10 text-fintech-success border-fintech-success/20",
  },
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: CircleDashed,
    className: "bg-muted text-muted-foreground border-border",
  },
  overdue: {
    label: "Overdue",
    variant: "destructive" as const,
    icon: AlertCircle,
    className: "bg-fintech-danger/10 text-fintech-danger border-fintech-danger/20 animate-pulse-slow",
  },
  partial: {
    label: "Partial",
    variant: "outline" as const,
    icon: Clock,
    className: "bg-fintech-warning/10 text-fintech-warning border-fintech-warning/20",
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Index() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredInvoices =
    selectedFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === selectedFilter);

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invoices
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and track your outstanding invoices
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="px-8 py-4 bg-card border-b border-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">$</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Outstanding
                </p>
                <p className="text-lg font-semibold text-foreground font-mono">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </div>

            <div className="w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-fintech-danger/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-fintech-danger" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Overdue
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {overdueCount} invoices
                </p>
              </div>
            </div>

            <div className="w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-fintech-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-fintech-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Collection Rate
                </p>
                <p className="text-lg font-semibold text-foreground">87.3%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-8 py-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            {["all", "overdue", "pending", "partial", "paid"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  selectedFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === "overdue" && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary-foreground/20">
                    {overdueCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          <div className="px-8 pb-8">
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary">
                        Invoice
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary">
                        Amount
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary">
                        Due Date
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Last Contact
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow
                        key={invoice.id}
                        className="table-row-hover cursor-pointer"
                      >
                        <TableCell>
                          <span className="font-mono text-sm font-medium text-foreground">
                            {invoice.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {invoice.customer}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {invoice.company}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-foreground">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground">
                              {formatDate(invoice.dueDate)}
                            </span>
                            {invoice.daysPastDue > 0 && (
                              <span className="text-xs text-fintech-danger font-medium">
                                {invoice.daysPastDue} days past due
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className={cn(
                              "gap-1 font-medium border",
                              status.className
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invoice.contactMethod === "email" && (
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            {invoice.contactMethod === "phone" && (
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {invoice.lastContact}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem>
                                Schedule Follow-up
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Write Off
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-muted-foreground">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
