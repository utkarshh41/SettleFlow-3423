import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
  Hash,
  IndianRupee,
  Save,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  List,
  Plus,
  ChevronRight,
  MessageSquare,
  CheckCheck,
  Send,
  X,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InvoiceStatus = "draft" | "sent" | "overdue" | "paid" | "due_tomorrow";

interface ExtractedInvoice {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

interface SavedInvoice {
  id: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  aiSuggestedAction: {
    type: "send_email" | "send_reminder" | "call_customer" | "none";
    label: string;
  };
}

type ViewState = "upload" | "analyzing" | "extracted" | "saved";
type TabState = "upload" | "list";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  sent: {
    label: "Sent",
    className: "bg-fintech-blue-light text-fintech-blue border-fintech-blue/20",
  },
  overdue: {
    label: "Overdue",
    className: "bg-fintech-danger/10 text-fintech-danger border-fintech-danger/20",
  },
  paid: {
    label: "Paid",
    className: "bg-fintech-success/10 text-fintech-success border-fintech-success/20",
  },
  due_tomorrow: {
    label: "Due Tomorrow",
    className: "bg-fintech-warning/10 text-fintech-warning border-fintech-warning/20",
  },
};

// Sample saved invoices data
const initialInvoices: SavedInvoice[] = [
  {
    id: "inv-001",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    amount: 45000,
    dueDate: "2024-01-15",
    status: "overdue",
    aiSuggestedAction: { type: "send_email", label: "Send Email" },
  },
  {
    id: "inv-002",
    customerName: "Beta Ltd",
    invoiceNumber: "INV-2024-0845",
    amount: 12000,
    dueDate: "2024-02-01",
    status: "due_tomorrow",
    aiSuggestedAction: { type: "send_email", label: "Send Email" },
  },
  {
    id: "inv-003",
    customerName: "TechVentures Pvt",
    invoiceNumber: "INV-2024-0839",
    amount: 78500,
    dueDate: "2024-01-20",
    status: "overdue",
    aiSuggestedAction: { type: "call_customer", label: "Call Customer" },
  },
  {
    id: "inv-004",
    customerName: "Global Solutions",
    invoiceNumber: "INV-2024-0851",
    amount: 156000,
    dueDate: "2024-02-10",
    status: "sent",
    aiSuggestedAction: { type: "none", label: "No Action Needed" },
  },
  {
    id: "inv-005",
    customerName: "Sunrise Industries",
    invoiceNumber: "INV-2024-0836",
    amount: 32500,
    dueDate: "2024-01-08",
    status: "paid",
    aiSuggestedAction: { type: "none", label: "Completed" },
  },
  {
    id: "inv-006",
    customerName: "Metro Distributors",
    invoiceNumber: "INV-2024-0848",
    amount: 89000,
    dueDate: "2024-01-25",
    status: "overdue",
    aiSuggestedAction: { type: "send_reminder", label: "Send Reminder" },
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Simulated AI analysis - in production this would call an actual API
function simulateAIAnalysis(): Promise<ExtractedInvoice> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const invoiceData: ExtractedInvoice = {
        customerName: "Reliance Industries Ltd",
        invoiceNumber: "INV-2024-0847",
        amount: 245000.5,
        dueDate: "2024-02-15",
        status: "sent",
      };
      resolve(invoiceData);
    }, 2500);
  });
}

function getAIRecommendationMessage(invoice: SavedInvoice): string {
  switch (invoice.status) {
    case "overdue":
      return `This invoice is overdue. The next best action is to send a payment reminder email to ${invoice.customerName}.`;
    case "due_tomorrow":
      return `This invoice is due tomorrow. Consider sending a friendly reminder to ${invoice.customerName} to ensure timely payment.`;
    case "sent":
      return `This invoice has been sent and is not yet due. No immediate action required.`;
    case "paid":
      return `This invoice has been paid. Thank ${invoice.customerName} for their timely payment.`;
    default:
      return `Review this invoice and take appropriate action based on the current status.`;
  }
}

function generatePaymentReminderEmail(invoice: SavedInvoice): string {
  return `Subject: Payment Reminder - Invoice ${invoice.invoiceNumber}

Dear ${invoice.customerName},

I hope this message finds you well. This is a friendly reminder regarding the outstanding invoice ${invoice.invoiceNumber} for the amount of ${formatCurrency(invoice.amount)}.

The payment was due on ${formatDate(invoice.dueDate)}. We kindly request you to arrange the payment at your earliest convenience.

Invoice Details:
• Invoice Number: ${invoice.invoiceNumber}
• Amount Due: ${formatCurrency(invoice.amount)}
• Due Date: ${formatDate(invoice.dueDate)}

If you have already made the payment, please disregard this reminder. Should you have any questions or need to discuss payment arrangements, please don't hesitate to reach out.

Thank you for your prompt attention to this matter.

Best regards,
John Doe
Collections Manager
AI Collection`;
}

function ActionIcon({ type }: { type: SavedInvoice["aiSuggestedAction"]["type"] }) {
  switch (type) {
    case "send_email":
    case "send_reminder":
      return <Mail className="w-3.5 h-3.5" />;
    case "call_customer":
      return <Phone className="w-3.5 h-3.5" />;
    default:
      return <CheckCircle2 className="w-3.5 h-3.5" />;
  }
}

// Toast notification component
function Toast({ 
  message, 
  type, 
  isVisible, 
  onClose 
}: { 
  message: string; 
  type: "success" | "info"; 
  isVisible: boolean; 
  onClose: () => void;
}) {
  if (!isVisible) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        type === "success" 
          ? "bg-fintech-success/10 border-fintech-success/30 text-fintech-success" 
          : "bg-primary/10 border-primary/30 text-primary"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      ) : (
        <ClipboardCheck className="w-5 h-5 shrink-0" />
      )}
      <span className="font-medium text-sm">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabState>("upload");
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedInvoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SavedInvoice | null>(null);
  const [invoices, setInvoices] = useState<SavedInvoice[]>(initialInvoices);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal and notification states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "info") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 4000);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setViewState("analyzing");

    try {
      const data = await simulateAIAnalysis();
      setExtractedData(data);
      setViewState("extracted");
    } catch (error) {
      console.error("Analysis failed:", error);
      setViewState("upload");
    }
  };

  const handleSave = () => {
    // In production, this would save to the database
    setViewState("saved");

    // Reset after showing success
    setTimeout(() => {
      setViewState("upload");
      setUploadedFile(null);
      setExtractedData(null);
    }, 2000);
  };

  const handleReset = () => {
    setViewState("upload");
    setUploadedFile(null);
    setExtractedData(null);
  };

  const handleInvoiceClick = (invoice: SavedInvoice) => {
    setSelectedInvoice(invoice);
  };

  const handleBackToList = () => {
    setSelectedInvoice(null);
  };

  // Invoice Detail Actions
  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
  };

  const handleConfirmSendEmail = () => {
    setIsSendingEmail(true);
    // Simulate sending email
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsEmailModalOpen(false);
      showToast("Payment reminder email sent successfully", "success");
    }, 1500);
  };

  const handleSimulateCustomerReply = () => {
    showToast("Task created: Follow up on customer reply", "info");
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;
    
    // Update invoice status
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, status: "paid" as InvoiceStatus, aiSuggestedAction: { type: "none" as const, label: "Completed" } }
          : inv
      )
    );
    
    // Update selected invoice
    setSelectedInvoice({
      ...selectedInvoice,
      status: "paid",
      aiSuggestedAction: { type: "none", label: "Completed" },
    });
    
    showToast("Invoice marked as paid", "success");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {activeTab === "upload" ? "Invoice Upload" : selectedInvoice ? "Invoice Details" : "Invoice List"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "upload"
                ? "Upload and analyze invoices with AI"
                : selectedInvoice
                ? `Viewing ${selectedInvoice.invoiceNumber}`
                : "Manage and track all your invoices"}
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-8 pt-4 bg-card border-b border-border">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab("upload");
                setSelectedInvoice(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px",
                activeTab === "upload"
                  ? "bg-background border-primary text-foreground"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Plus className="w-4 h-4" />
              Upload Invoice
            </button>
            <button
              onClick={() => {
                setActiveTab("list");
                setSelectedInvoice(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px",
                activeTab === "list"
                  ? "bg-background border-primary text-foreground"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <List className="w-4 h-4" />
              Invoice List
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                {invoices.length}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === "upload" && (
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="w-full max-w-2xl">
              {/* Upload State */}
              {viewState === "upload" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group",
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : uploadedFile
                        ? "border-fintech-success bg-fintech-success/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center text-center">
                      {uploadedFile ? (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-fintech-success/10 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-fintech-success" />
                          </div>
                          <p className="text-lg font-medium text-foreground mb-1">
                            {uploadedFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Ready to analyze
                          </p>
                        </>
                      ) : (
                        <>
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                              isDragging ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10"
                            )}
                          >
                            <Upload
                              className={cn(
                                "w-8 h-8 transition-colors",
                                isDragging
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-primary"
                              )}
                            />
                          </div>
                          <p className="text-lg font-medium text-foreground mb-1">
                            Drop your invoice here
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            or click to browse files
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Supports PDF and image files
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <Button
                    onClick={handleAnalyze}
                    disabled={!uploadedFile}
                    size="lg"
                    className="w-full h-14 text-base font-medium gap-3 rounded-xl"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze Invoice
                  </Button>
                </div>
              )}

              {/* Analyzing State */}
              {viewState === "analyzing" && (
                <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Analyzing invoice with AI...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Extracting details from your document
                  </p>
                </div>
              )}

              {/* Extracted Data State */}
              {viewState === "extracted" && extractedData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border-2 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 rounded-xl bg-fintech-success/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-fintech-success" />
                        </div>
                        Invoice Details Extracted
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-5">
                        {/* Customer Name */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Customer Name
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {extractedData.customerName}
                            </p>
                          </div>
                        </div>

                        {/* Invoice Number */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Hash className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Invoice Number
                            </p>
                            <p className="text-base font-mono font-semibold text-foreground">
                              {extractedData.invoiceNumber}
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <IndianRupee className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Amount
                            </p>
                            <p className="text-xl font-mono font-bold text-foreground">
                              {formatCurrency(extractedData.amount)}
                            </p>
                          </div>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Due Date
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {formatDate(extractedData.dueDate)}
                            </p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Status
                            </p>
                            <span
                              className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                                statusConfig[extractedData.status].className
                              )}
                            >
                              {statusConfig[extractedData.status].label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 h-12 rounded-xl"
                    >
                      Upload Another
                    </Button>
                    <Button onClick={handleSave} className="flex-1 h-12 rounded-xl gap-2">
                      <Save className="w-4 h-4" />
                      Save Invoice
                    </Button>
                  </div>
                </div>
              )}

              {/* Saved State */}
              {viewState === "saved" && (
                <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 rounded-full bg-fintech-success/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-fintech-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Invoice Saved Successfully
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customer and invoice records have been created
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice List View */}
        {activeTab === "list" && !selectedInvoice && (
          <div className="flex-1 p-8 overflow-auto animate-in fade-in duration-300">
            <Card className="border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold text-foreground">Customer</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-foreground">Due Date</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">AI Suggested Action</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, index) => (
                    <TableRow
                      key={invoice.id}
                      onClick={() => handleInvoiceClick(invoice)}
                      className={cn(
                        "cursor-pointer table-row-hover group",
                        "animate-in fade-in slide-in-from-bottom-2",
                        index === 0 && "duration-200",
                        index === 1 && "duration-300",
                        index === 2 && "duration-400",
                        index >= 3 && "duration-500"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{invoice.customerName}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-semibold text-foreground">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{formatDate(invoice.dueDate)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium border",
                            statusConfig[invoice.status].className,
                            invoice.status === "overdue" && "animate-pulse-slow"
                          )}
                        >
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-sm",
                            invoice.aiSuggestedAction.type === "none"
                              ? "text-muted-foreground"
                              : invoice.aiSuggestedAction.type === "call_customer"
                              ? "text-fintech-warning bg-fintech-warning/10"
                              : "text-primary bg-primary/10"
                          )}
                        >
                          <ActionIcon type={invoice.aiSuggestedAction.type} />
                          <span className="font-medium">{invoice.aiSuggestedAction.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Invoice Detail View - Enhanced */}
        {activeTab === "list" && selectedInvoice && (
          <div className="flex-1 p-8 overflow-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackToList}
                className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Invoice List
              </Button>

              {/* Invoice Summary Card */}
              <Card className="border-2 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      {selectedInvoice.invoiceNumber}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium border text-sm",
                        statusConfig[selectedInvoice.status].className
                      )}
                    >
                      {statusConfig[selectedInvoice.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    {/* Customer Name */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Customer Name
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {selectedInvoice.customerName}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Amount
                        </p>
                        <p className="text-2xl font-mono font-bold text-foreground">
                          {formatCurrency(selectedInvoice.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Due Date
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {formatDate(selectedInvoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendation Card */}
              <Card className={cn(
                "border-2 overflow-hidden relative",
                selectedInvoice.status === "overdue" && "border-fintech-danger/30 bg-fintech-danger/5",
                selectedInvoice.status === "due_tomorrow" && "border-fintech-warning/30 bg-fintech-warning/5",
                selectedInvoice.status === "paid" && "border-fintech-success/30 bg-fintech-success/5"
              )}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      selectedInvoice.status === "overdue" && "bg-fintech-danger/10",
                      selectedInvoice.status === "due_tomorrow" && "bg-fintech-warning/10",
                      selectedInvoice.status === "paid" && "bg-fintech-success/10",
                      selectedInvoice.status === "sent" && "bg-primary/10",
                      selectedInvoice.status === "draft" && "bg-muted"
                    )}>
                      <Sparkles className={cn(
                        "w-6 h-6",
                        selectedInvoice.status === "overdue" && "text-fintech-danger",
                        selectedInvoice.status === "due_tomorrow" && "text-fintech-warning",
                        selectedInvoice.status === "paid" && "text-fintech-success",
                        selectedInvoice.status === "sent" && "text-primary",
                        selectedInvoice.status === "draft" && "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">AI Recommendation</h3>
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Smart Insight
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {getAIRecommendationMessage(selectedInvoice)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-12 rounded-xl gap-2"
                  onClick={handleSendEmail}
                  disabled={selectedInvoice.status === "paid"}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl gap-2"
                  onClick={handleSimulateCustomerReply}
                  disabled={selectedInvoice.status === "paid"}
                >
                  <MessageSquare className="w-4 h-4" />
                  Simulate Customer Reply
                </Button>
                <Button 
                  className="h-12 rounded-xl gap-2 bg-fintech-success hover:bg-fintech-success/90 text-white"
                  onClick={handleMarkAsPaid}
                  disabled={selectedInvoice.status === "paid"}
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark as Paid
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              Payment Reminder Email
            </DialogTitle>
            <DialogDescription>
              Review the AI-generated email before sending to {selectedInvoice?.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto py-4">
            <div className="bg-muted/50 rounded-xl p-5 font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
              {selectedInvoice && generatePaymentReminderEmail(selectedInvoice)}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEmailModalOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSendEmail}
              disabled={isSendingEmail}
              className="gap-2"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
