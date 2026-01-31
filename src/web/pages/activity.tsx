import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Sparkles,
  Mail,
  MessageSquare,
  ClipboardCheck,
  CheckCircle2,
  FileText,
  User,
  AlertCircle,
  Bell,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType =
  | "invoice_uploaded"
  | "ai_suggestion"
  | "email_sent"
  | "customer_reply_simulated"
  | "task_created"
  | "payment_recorded"
  | "status_changed";

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  customerName?: string;
  invoiceNumber?: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    oldStatus?: string;
    newStatus?: string;
    suggestionType?: string;
  };
}

// Mock activity data demonstrating full flow
const mockActivities: Activity[] = [
  // Today's activities
  {
    id: "act-001",
    type: "payment_recorded",
    description: "Payment of ₹32,500 received",
    customerName: "Sunrise Industries",
    invoiceNumber: "INV-2024-0836",
    timestamp: new Date(Date.now() - 1000 * 60 * 23), // 23 minutes ago
    metadata: { amount: 32500 },
  },
  {
    id: "act-002",
    type: "task_created",
    description: "Follow-up task created after customer reply simulation",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: "act-003",
    type: "customer_reply_simulated",
    description: "Customer reply simulation triggered",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 47), // 47 minutes ago
  },
  {
    id: "act-004",
    type: "email_sent",
    description: "Payment reminder email sent",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: "act-005",
    type: "ai_suggestion",
    description: "AI recommended sending payment reminder",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 62), // 1 hour 2 minutes ago
    metadata: { suggestionType: "send_email" },
  },
  {
    id: "act-006",
    type: "status_changed",
    description: "Invoice status changed",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    metadata: { oldStatus: "Sent", newStatus: "Overdue" },
  },
  // Yesterday's activities
  {
    id: "act-007",
    type: "email_sent",
    description: "Payment reminder email sent",
    customerName: "Beta Ltd",
    invoiceNumber: "INV-2024-0845",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
  },
  {
    id: "act-008",
    type: "ai_suggestion",
    description: "AI recommended sending early reminder",
    customerName: "Beta Ltd",
    invoiceNumber: "INV-2024-0845",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26.5), // 26.5 hours ago
    metadata: { suggestionType: "send_reminder" },
  },
  {
    id: "act-009",
    type: "invoice_uploaded",
    description: "New invoice uploaded and analyzed",
    customerName: "Global Solutions",
    invoiceNumber: "INV-2024-0851",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28), // 28 hours ago
    metadata: { amount: 156000 },
  },
  // Earlier this week
  {
    id: "act-010",
    type: "payment_recorded",
    description: "Payment of ₹78,500 received",
    customerName: "TechVentures Pvt",
    invoiceNumber: "INV-2024-0839",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    metadata: { amount: 78500 },
  },
  {
    id: "act-011",
    type: "task_created",
    description: "Call task created for escalation",
    customerName: "Metro Distributors",
    invoiceNumber: "INV-2024-0848",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
  },
  {
    id: "act-012",
    type: "ai_suggestion",
    description: "AI recommended calling customer",
    customerName: "Metro Distributors",
    invoiceNumber: "INV-2024-0848",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96.5), // 4 days ago
    metadata: { suggestionType: "call_customer" },
  },
  {
    id: "act-013",
    type: "email_sent",
    description: "Second reminder email sent",
    customerName: "Metro Distributors",
    invoiceNumber: "INV-2024-0848",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
  },
  {
    id: "act-014",
    type: "invoice_uploaded",
    description: "New invoice uploaded and analyzed",
    customerName: "Sunrise Industries",
    invoiceNumber: "INV-2024-0836",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144), // 6 days ago
    metadata: { amount: 32500 },
  },
];

const activityConfig: Record<
  ActivityType,
  {
    icon: typeof Upload;
    label: string;
    iconBg: string;
    iconColor: string;
    lineColor: string;
  }
> = {
  invoice_uploaded: {
    icon: Upload,
    label: "Invoice Uploaded",
    iconBg: "bg-fintech-blue-light",
    iconColor: "text-fintech-blue",
    lineColor: "bg-fintech-blue/30",
  },
  ai_suggestion: {
    icon: Sparkles,
    label: "AI Suggestion",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    lineColor: "bg-purple-400/30",
  },
  email_sent: {
    icon: Mail,
    label: "Email Sent",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    lineColor: "bg-blue-400/30",
  },
  customer_reply_simulated: {
    icon: MessageSquare,
    label: "Customer Reply Simulated",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    lineColor: "bg-orange-400/30",
  },
  task_created: {
    icon: ClipboardCheck,
    label: "Task Created",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    lineColor: "bg-amber-400/30",
  },
  payment_recorded: {
    icon: CheckCircle2,
    label: "Payment Recorded",
    iconBg: "bg-fintech-success/10",
    iconColor: "text-fintech-success",
    lineColor: "bg-fintech-success/30",
  },
  status_changed: {
    icon: AlertCircle,
    label: "Status Changed",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    lineColor: "bg-slate-400/30",
  },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);
  const activityDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (activityDate.getTime() === today.getTime()) return "Today";
  if (activityDate.getTime() === yesterday.getTime()) return "Yesterday";

  // Check if within this week
  const weekStart = new Date(today.getTime() - today.getDay() * 1000 * 60 * 60 * 24);
  if (activityDate >= weekStart) return "Earlier This Week";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();

  for (const activity of activities) {
    const group = getDateGroup(activity.timestamp);
    const existing = groups.get(group) ?? [];
    groups.set(group, [...existing, activity]);
  }

  return groups;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ActivityItem({
  activity,
  isLast,
  index,
}: {
  activity: Activity;
  isLast: boolean;
  index: number;
}) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex gap-4 animate-in fade-in slide-in-from-left-4"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationDuration: "400ms" }}
    >
      {/* Timeline connector */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-5 top-12 w-0.5 h-[calc(100%-16px)]",
            config.lineColor
          )}
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          config.iconBg
        )}
      >
        <Icon className={cn("w-5 h-5", config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <Card className="p-4 border hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Activity type badge */}
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    activity.type === "payment_recorded" &&
                      "bg-fintech-success/10 text-fintech-success border-fintech-success/20",
                    activity.type === "ai_suggestion" &&
                      "bg-purple-100 text-purple-700 border-purple-200",
                    activity.type === "email_sent" &&
                      "bg-blue-100 text-blue-700 border-blue-200",
                    activity.type === "invoice_uploaded" &&
                      "bg-fintech-blue-light text-fintech-blue border-fintech-blue/20",
                    activity.type === "task_created" &&
                      "bg-amber-100 text-amber-700 border-amber-200",
                    activity.type === "customer_reply_simulated" &&
                      "bg-orange-100 text-orange-700 border-orange-200",
                    activity.type === "status_changed" &&
                      "bg-slate-100 text-slate-700 border-slate-200"
                  )}
                >
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTime(activity.timestamp)}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm font-medium text-foreground mb-2">
                {activity.description}
              </p>

              {/* Metadata */}
              {activity.metadata?.oldStatus && activity.metadata?.newStatus && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-muted">
                    {activity.metadata.oldStatus}
                  </span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 rounded-md bg-fintech-danger/10 text-fintech-danger">
                    {activity.metadata.newStatus}
                  </span>
                </div>
              )}

              {/* Related invoice/customer */}
              {(activity.customerName || activity.invoiceNumber) && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {activity.customerName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span>{activity.customerName}</span>
                    </div>
                  )}
                  {activity.invoiceNumber && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      <span className="font-mono">{activity.invoiceNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount (if applicable) */}
            {activity.metadata?.amount && (
              <div className="text-right shrink-0">
                <p
                  className={cn(
                    "text-sm font-mono font-semibold",
                    activity.type === "payment_recorded"
                      ? "text-fintech-success"
                      : "text-foreground"
                  )}
                >
                  {activity.type === "payment_recorded" && "+"}
                  {formatCurrency(activity.metadata.amount)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const groupedActivities = groupActivitiesByDate(mockActivities);
  let globalIndex = 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Activity Log
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track all actions and events across your invoices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 bg-primary/5 border-primary/20"
            >
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {mockActivities.length} activities
              </span>
            </Badge>
          </div>
        </header>

        {/* Activity Timeline */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            {Array.from(groupedActivities.entries()).map(
              ([dateGroup, activities], groupIndex) => (
                <div
                  key={dateGroup}
                  className={cn(
                    "mb-8 animate-in fade-in",
                    groupIndex === 0 && "duration-200",
                    groupIndex === 1 && "duration-300",
                    groupIndex >= 2 && "duration-400"
                  )}
                  style={{ animationDelay: `${groupIndex * 100}ms` }}
                >
                  {/* Date group header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      {dateGroup}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                  </div>

                  {/* Activities in this group */}
                  <div>
                    {activities.map((activity, idx) => {
                      const currentIndex = globalIndex++;
                      return (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          isLast={idx === activities.length - 1}
                          index={currentIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {/* End of timeline indicator */}
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-px w-12 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  End of Activity Log
                </span>
                <div className="h-px w-12 bg-border" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
