import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, User, Clock, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

interface CustomerEmail {
  id: string;
  subject: string;
  body: string;
  output: string;
}

const sampleEmails: CustomerEmail[] = [
  {
    id: "email-001",
    subject: "Re: Payment regarding invoice INV-2024-001",
    body: "Hi, Apologies for the late reply here. We will close and make the payment by 12-Feb for INV-2024-001",
    output: "Should update expected payment date for INV-2024-001 to 12-Feb",
  },
  {
    id: "email-002",
    subject: "Re: Payment regarding invoice INV-2024-002",
    body: "Payment for invoice INV-2024-002 is already via UTR NEFT-HDFC009812131.",
    output:
      "Should update expected paid amount for INV-2024-002 and mark it fully paid",
  },
  {
    id: "email-003",
    subject: "Re: Payment regarding invoice INV-2024-003",
    body: "Please correct the GST and re share the invoice for INV-2024-003.",
    output: "Should create a task against invoice INV-2024-003",
  },
  {
    id: "email-004",
    subject: "Re: Payment regarding invoice INV-2024-004",
    body: "We have not made any such purchase. Please revert invoice INV-2024-004 or issue a credit note.",
    output: "Should create a task against invoice INV-2024-004",
  },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function EmailCard({
  email,
  onClick,
  index,
}: {
  email: CustomerEmail;
  onClick: () => void;
  index: number;
}) {
  return (
    <Card
      className="p-4 border transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 hover:border-primary/40 hover:shadow-sm"
      style={{ animationDelay: `${index * 50}ms`, animationDuration: "350ms" }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Email Icon */}
        <div className="mt-0.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Mail className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-medium text-foreground truncate">
              {email.subject}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {email.body}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function CustomerEmailsPage() {
  const [selectedEmail, setSelectedEmail] = useState<CustomerEmail | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      type,
      message,
    };
    setToast(newToast);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendEmail = async () => {
    if (!selectedEmail) return;

    setIsSending(true);

    try {
      const response = await fetch(
        "https://cdc9cd9a6e2d.ngrok-free.app/gmail/webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            id: selectedEmail.id,
            threadId: selectedEmail.id,
            snippet: selectedEmail.body,
            payload: {
              mimeType: "text/plain",
            },
            sizeEstimate: selectedEmail.body.length,
            historyId: Date.now().toString(),
            internalDate: new Date().toISOString(),
            labels: [
              {
                id: "sent",
                name: "SENT",
              },
            ],
            From: "customer@example.com",
            Subject: selectedEmail.subject,
            To: "settleflow@example.com",
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast("success", "Email sent successfully");
      setSelectedEmail(null);
    } catch (error) {
      console.error("Error sending email:", error);
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to send email",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Reply as customer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Try these sample emails on behalf of your customers and see how
              the system behaves
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">
                {sampleEmails.length} Emails
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto space-y-3">
            {sampleEmails.map((email, index) => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() => setSelectedEmail(email)}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Email Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold">Email Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and send this email
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmail(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedEmail.output && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Expected Action
                      </p>
                      <p className="text-sm text-green-700">
                        {selectedEmail.output}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Subject
                </label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedEmail.subject}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Message
                </label>
                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setSelectedEmail(null)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
                className="gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-4 duration-300">
          <div
            className={cn(
              "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px]",
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800",
            )}
          >
            {toast.type === "success" ? (
              <Send className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
