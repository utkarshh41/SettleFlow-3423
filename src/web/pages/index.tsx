import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type InvoiceStatus = "draft" | "sent" | "overdue" | "paid";

interface ExtractedInvoice {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

type ViewState = "upload" | "analyzing" | "extracted" | "saved";

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
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
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
        amount: 245000.50,
        dueDate: "2024-02-15",
        status: "sent",
      };
      resolve(invoiceData);
    }, 2500);
  });
}

export default function Index() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedInvoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invoice Upload
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload and analyze invoices with AI
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
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
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                          isDragging ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10"
                        )}>
                          <Upload className={cn(
                            "w-8 h-8 transition-colors",
                            isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                          )} />
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
                  <Button
                    onClick={handleSave}
                    className="flex-1 h-12 rounded-xl gap-2"
                  >
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
      </main>
    </div>
  );
}
