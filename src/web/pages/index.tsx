import { useState, useRef, useCallback, useEffect } from "react";
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
  UploadCloudIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAppStore,
  type SavedInvoice,
  type InvoiceStatus,
} from "@/store/app-store";

interface ExtractedInvoice {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

type ViewState = "upload" | "analyzing" | "extracted" | "saved" | "error";
type TabState = "upload" | "list";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
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
    className:
      "bg-fintech-danger/10 text-fintech-danger border-fintech-danger/20",
  },
  paid: {
    label: "Paid",
    className:
      "bg-fintech-success/10 text-fintech-success border-fintech-success/20",
  },
  due_tomorrow: {
    label: "Due Tomorrow",
    className:
      "bg-fintech-warning/10 text-fintech-warning border-fintech-warning/20",
  },
};

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
      // Generate a unique invoice number
      const invoiceNum = `INV-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const invoiceData: ExtractedInvoice = {
        customerName: "Reliance Industries Ltd",
        invoiceNumber: invoiceNum,
        amount: 245000,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
          .toISOString()
          .split("T")[0], // 14 days from now
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
Anirudh Bharghawa
Collections Manager
AI Collection`;
}

function ActionIcon({
  type,
}: {
  type: SavedInvoice["aiSuggestedAction"]["type"];
}) {
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
  onClose,
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
          : "bg-primary/10 border-primary/30 text-primary",
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
  const {
    invoices,
    isLoading,
    apiError,
    fetchInvoices,
    addInvoice,
    sendEmailForInvoice,
    simulateCustomerReply,
    markInvoiceAsPaid,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabState>("upload");
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedInvoice | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SavedInvoice | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal and notification states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const showToast = (message: string, type: "success" | "info") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setUploadedFile(files[0]);
      }
    },
    [],
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setViewState("analyzing");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("http://10.4.144.243:5000/parse/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convert API response to our format
      const extractedData: ExtractedInvoice = {
        customerName: data.customer_name || "Unknown Customer",
        invoiceNumber: data.invoice_number || "Unknown Invoice",
        amount: data.invoice_total_amount || 0,
        dueDate:
          data.invoice_due_date || new Date().toISOString().split("T")[0],
        status:
          data.invoice_paid_amount >= data.invoice_total_amount
            ? "paid"
            : "sent",
      };

      // Automatically save the invoice to the store
      addInvoice({
        customerName: extractedData.customerName,
        invoiceNumber: extractedData.invoiceNumber,
        amount: extractedData.amount,
        dueDate: extractedData.dueDate,
        status: extractedData.status,
      });

      setExtractedData(extractedData);
      setViewState("extracted");
    } catch (error) {
      console.error("Analysis failed:", error);

      // Show error message to user
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to analyze invoice. Please try again.";

      setErrorMessage(errorMessage);
      setViewState("error");
    }
  };

  const handleSave = () => {
    if (!extractedData) return;

    // Add invoice to the store (this also creates customer record and adds activity)
    addInvoice({
      customerName: extractedData.customerName,
      invoiceNumber: extractedData.invoiceNumber,
      amount: extractedData.amount,
      dueDate: extractedData.dueDate,
      status: extractedData.status,
    });

    setViewState("saved");

    // Reset after showing success
    setTimeout(() => {
      setViewState("upload");
      setUploadedFile(null);
      setExtractedData(null);
      // Switch to list view to see the newly added invoice
      setActiveTab("list");
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
    if (!selectedInvoice) return;

    setIsSendingEmail(true);
    // Simulate sending email
    setTimeout(() => {
      // Add activity to the store
      sendEmailForInvoice(selectedInvoice);

      setIsSendingEmail(false);
      setIsEmailModalOpen(false);
      showToast("Payment reminder email sent successfully", "success");
    }, 1500);
  };

  const handleSimulateCustomerReply = () => {
    if (!selectedInvoice) return;

    // This creates a task and adds activities to the store
    simulateCustomerReply(selectedInvoice);
    showToast("Task created: Fix invoice issue raised by customer", "info");
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;

    // Update invoice status and add activity to the store
    markInvoiceAsPaid(selectedInvoice.id);

    // Update local selected invoice state to reflect the change
    setSelectedInvoice({
      ...selectedInvoice,
      status: "paid",
      aiSuggestedAction: { type: "none", label: "Completed" },
    });

    showToast("Invoice marked as paid", "success");
  };

  // Get current selected invoice from store (to reflect any updates)
  const currentSelectedInvoice = selectedInvoice
    ? (invoices.find((inv) => inv.id === selectedInvoice.id) ?? selectedInvoice)
    : null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {activeTab === "upload"
                ? "Invoice Upload"
                : currentSelectedInvoice
                  ? "Invoice Details"
                  : "Invoice List"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "upload"
                ? "Upload and analyze invoices with AI"
                : currentSelectedInvoice
                  ? `Viewing ${currentSelectedInvoice.invoiceNumber}`
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
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
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
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <List className="w-4 h-4" />
              Invoice List
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
                          : "border-border hover:border-primary/50 hover:bg-muted/30",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
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
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Ready
                            to analyze
                          </p>
                        </>
                      ) : (
                        <>
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                              isDragging
                                ? "bg-primary/10"
                                : "bg-muted group-hover:bg-primary/10",
                            )}
                          >
                            <Upload
                              className={cn(
                                "w-8 h-8 transition-colors",
                                isDragging
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-primary",
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
                            Supports PDF files
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
                    <UploadCloudIcon className="w-5 h-5" />
                    Upload
                  </Button>
                </div>
              )}

              {/* Analyzing State */}
              {viewState === "analyzing" && (
                <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <UploadCloudIcon className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Uploading Invoice...
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
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-fintech-success/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-fintech-success" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Invoice Uploaded Successfully!
                      </h3>
                      <p className="text-muted-foreground">
                        Invoice has been processed and saved to your invoice
                        list.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Upload Another Button */}
                  <Button
                    onClick={handleReset}
                    className="w-full h-12 rounded-xl gap-2"
                  >
                    <UploadCloudIcon className="w-4 h-4" />
                    Upload Another Invoice
                  </Button>
                </div>
              )}

              {/* Error State */}
              {viewState === "error" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border-2 border-fintech-danger/20 overflow-hidden">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-fintech-danger/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-fintech-danger" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Invoice Analysis Failed!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {errorMessage ||
                          "An error occurred while processing your invoice."}
                      </p>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="gap-2"
                      >
                        <UploadCloudIcon className="w-4 h-4" />
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
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
        {activeTab === "list" && !currentSelectedInvoice && (
          <div className="flex-1 p-8 overflow-auto animate-in fade-in duration-300">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading invoices...</p>
                </div>
              </div>
            )}

            {apiError && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4 max-w-md text-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-destructive font-medium">
                      Failed to load invoices
                    </p>
                  </div>
                  <Button onClick={fetchInvoices} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !apiError && (
              <Card className="border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold text-foreground">
                        Customer
                      </TableHead>
                      <TableHead className="font-semibold text-foreground text-right">
                        Amount
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Due Date
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        AI Suggested Action
                      </TableHead>
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
                          index >= 3 && "duration-500",
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {invoice.customerName}
                            </span>
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
                          <span className="text-muted-foreground">
                            {formatDate(invoice.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium border",
                              statusConfig[invoice.status].className,
                              invoice.status === "overdue" &&
                                "animate-pulse-slow",
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
                                : invoice.aiSuggestedAction.type ===
                                    "call_customer"
                                  ? "text-fintech-warning bg-fintech-warning/10"
                                  : "text-primary bg-primary/10",
                            )}
                          >
                            <ActionIcon type={invoice.aiSuggestedAction.type} />
                            <span className="font-medium">
                              {invoice.aiSuggestedAction.label}
                            </span>
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
            )}
          </div>
        )}

        {/* Invoice Detail View - Enhanced */}
        {activeTab === "list" && currentSelectedInvoice && (
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
                      {currentSelectedInvoice.invoiceNumber}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium border text-sm",
                        statusConfig[currentSelectedInvoice.status].className,
                      )}
                    >
                      {statusConfig[currentSelectedInvoice.status].label}
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
                          {currentSelectedInvoice.customerName}
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
                          {formatCurrency(currentSelectedInvoice.amount)}
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
                          {formatDate(currentSelectedInvoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendation Card */}
              <Card
                className={cn(
                  "border-2 overflow-hidden relative",
                  currentSelectedInvoice.status === "overdue" &&
                    "border-fintech-danger/30 bg-fintech-danger/5",
                  currentSelectedInvoice.status === "due_tomorrow" &&
                    "border-fintech-warning/30 bg-fintech-warning/5",
                  currentSelectedInvoice.status === "paid" &&
                    "border-fintech-success/30 bg-fintech-success/5",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        currentSelectedInvoice.status === "overdue" &&
                          "bg-fintech-danger/10",
                        currentSelectedInvoice.status === "due_tomorrow" &&
                          "bg-fintech-warning/10",
                        currentSelectedInvoice.status === "paid" &&
                          "bg-fintech-success/10",
                        currentSelectedInvoice.status === "sent" &&
                          "bg-primary/10",
                        currentSelectedInvoice.status === "draft" && "bg-muted",
                      )}
                    >
                      <Sparkles
                        className={cn(
                          "w-6 h-6",
                          currentSelectedInvoice.status === "overdue" &&
                            "text-fintech-danger",
                          currentSelectedInvoice.status === "due_tomorrow" &&
                            "text-fintech-warning",
                          currentSelectedInvoice.status === "paid" &&
                            "text-fintech-success",
                          currentSelectedInvoice.status === "sent" &&
                            "text-primary",
                          currentSelectedInvoice.status === "draft" &&
                            "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          AI Recommendation
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          Smart Insight
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {getAIRecommendationMessage(currentSelectedInvoice)}
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
                  disabled={currentSelectedInvoice.status === "paid"}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl gap-2"
                  onClick={handleSimulateCustomerReply}
                  disabled={currentSelectedInvoice.status === "paid"}
                >
                  <MessageSquare className="w-4 h-4" />
                  Simulate Customer Reply
                </Button>
                <Button
                  className="h-12 rounded-xl gap-2 bg-fintech-success hover:bg-fintech-success/90 text-white"
                  onClick={handleMarkAsPaid}
                  disabled={currentSelectedInvoice.status === "paid"}
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
              Review the AI-generated email before sending to{" "}
              {currentSelectedInvoice?.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            <div className="bg-muted/50 rounded-xl p-5 font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
              {currentSelectedInvoice &&
                generatePaymentReminderEmail(currentSelectedInvoice)}
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
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
