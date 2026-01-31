import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, User, Clock, Send, X } from "lucide-react";
import { useState } from "react";

interface CustomerEmail {
  id: string;
  subject: string;
  body: string;
}

const sampleEmails: CustomerEmail[] = [
  {
    id: "email-001",
    subject: "Payment Reminder - Invoice INV-2024-0842",
    body: "Dear Acme Corp,\n\nThis is a friendly reminder that your invoice INV-2024-0842 for ₹45,000 is now overdue. The payment was due on January 15, 2024.\n\nPlease process the payment at your earliest convenience to avoid any late payment charges.\n\nIf you have already made the payment, please disregard this email.\n\nBest regards,\nSettleFlow Collections Team",
  },
  {
    id: "email-002",
    subject: "Follow-up on Outstanding Payment",
    body: "Hello Beta Ltd,\n\nWe're following up on the outstanding payment for invoice INV-2024-0845 amounting to ₹12,000.\n\nThe due date is approaching (February 1, 2024). Please ensure timely payment to maintain your good payment record.\n\nThank you for your prompt attention to this matter.\n\nRegards,\nCollections Team",
  },
  {
    id: "email-003",
    subject: "Urgent: Overdue Payment Notice",
    body: "Dear TechVentures Pvt,\n\nYour invoice INV-2024-0839 for ₹78,500 is significantly overdue. The payment was due on January 20, 2024.\n\nImmediate action is required to settle this payment. Please contact us if you're facing any issues with the payment process.\n\nFailure to make payment may result in additional charges and affect your credit standing.\n\nSincerely,\nSettleFlow Collections",
  },
  {
    id: "email-004",
    subject: "Payment Confirmation Request",
    body: "Hello Global Solutions,\n\nWe're writing to confirm the status of your payment for invoice INV-2024-0851 (₹156,000) due on February 10, 2024.\n\nPlease let us know if you've already initiated the payment or if you need any assistance with the payment process.\n\nWe value your business and are here to help.\n\nBest regards,\nCustomer Support Team",
  },
  {
    id: "email-005",
    subject: "Final Payment Reminder",
    body: "Dear Metro Distributors,\n\nThis is the final reminder for your overdue payment of ₹89,000 for invoice INV-2024-0848.\n\nThe payment was due on January 25, 2024 and is now significantly overdue. Please arrange for immediate payment to avoid further action.\n\nIf you're experiencing financial difficulties, please contact us to discuss payment arrangements.\n\nUrgent attention required.\n\nCollections Department",
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

  const handleSendEmail = async () => {
    if (!selectedEmail) return;

    setIsSending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSending(false);
    setSelectedEmail(null);

    // Here you would show a success toast
    console.log("Email sent successfully");
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
              Try on these sample emails on behalf of your customers and see how
              system behaves
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
    </div>
  );
}
