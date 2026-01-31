import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Building2,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Customer } from "@/store/app-store";
import { useEffect } from "react";

function formatCurrency(amount: number) {
  if (amount === 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CustomerCard({
  customer,
  index,
}: {
  customer: Customer;
  index: number;
}) {
  const hasOverdue = customer.overdueCount > 0;
  const isPaid = customer.totalOutstanding === 0;

  return (
    <Card
      className={cn(
        "p-5 border transition-all hover:border-primary/40 hover:shadow-sm animate-in fade-in slide-in-from-bottom-2",
      )}
      style={{ animationDelay: `${index * 50}ms`, animationDuration: "350ms" }}
    >
      <div className="flex items-start justify-between">
        {/* Customer Info */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
              hasOverdue
                ? "bg-fintech-danger/10"
                : isPaid
                  ? "bg-fintech-success/10"
                  : "bg-fintech-blue-light",
            )}
          >
            <Building2
              className={cn(
                "w-5 h-5",
                hasOverdue
                  ? "text-fintech-danger"
                  : isPaid
                    ? "text-fintech-success"
                    : "text-fintech-blue",
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {customer.name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                <span>
                  {customer.invoiceCount} invoice
                  {customer.invoiceCount !== 1 ? "s" : ""}
                </span>
              </div>
              {hasOverdue && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 bg-fintech-danger/10 text-fintech-danger border-fintech-danger/20"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {customer.overdueCount} overdue
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Outstanding Amount */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
          <div
            className={cn(
              "text-sm font-mono font-semibold",
              hasOverdue
                ? "text-fintech-danger"
                : isPaid
                  ? "text-fintech-success"
                  : "text-foreground",
            )}
          >
            {formatCurrency(customer.totalOutstanding)}
          </div>
          {isPaid && (
            <Badge
              variant="outline"
              className="mt-1 text-[10px] px-1.5 py-0 h-5 bg-fintech-success/10 text-fintech-success border-fintech-success/20"
            >
              All Paid
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function CustomersPage() {
  const { customers, customersLoading, customersError, fetchCustomers } =
    useAppStore();

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + c.totalOutstanding,
    0,
  );
  const customersWithOverdue = customers.filter(
    (c) => c.overdueCount > 0,
  ).length;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Customers
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All customers from uploaded invoices
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fintech-blue-light text-fintech-blue">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {totalCustomers} Customers
              </span>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="px-8 py-4 border-b border-border bg-card/50">
          <div className="max-w-3xl mx-auto flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fintech-blue-light flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-fintech-blue" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Total Outstanding
                </div>
                <div className="text-lg font-mono font-semibold text-foreground">
                  {formatCurrency(totalOutstanding)}
                </div>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fintech-danger/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-fintech-danger" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  With Overdue
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {customersWithOverdue} customer
                  {customersWithOverdue !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            {customersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading customers...</p>
                </div>
              </div>
            ) : customersError ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4 max-w-md text-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-destructive font-medium">
                      Failed to load customers
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {customersError}
                    </p>
                  </div>
                  <Button onClick={fetchCustomers} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : customers.length > 0 ? (
              <div className="space-y-3">
                {customers.map((customer, index) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No customers yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customers will appear here when invoices are uploaded
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
