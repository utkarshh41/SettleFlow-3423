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
  ArrowRight,
  Activity as ActivityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type Activity, type ActivityType } from "@/store/app-store";

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
                  {activity.type === "payment_recorded" ? "+" : ""}
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

function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <ActivityIcon className="w-4 h-4 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function ActivityPage() {
  const { activities } = useAppStore();
  
  // Sort activities by timestamp (most recent first)
  const sortedActivities = [...activities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  const groupedActivities = groupActivitiesByDate(sortedActivities);
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
              Track all collection activities and updates
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
            <ActivityIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {activities.length} Activities
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            {activities.length > 0 ? (
              <div className="space-y-8">
                {Array.from(groupedActivities.entries()).map(
                  ([dateGroup, groupActivities]) => (
                    <div key={dateGroup}>
                      <DateGroupHeader label={dateGroup} />
                      <div className="pl-2">
                        {groupActivities.map((activity, index) => {
                          const currentIndex = globalIndex++;
                          return (
                            <ActivityItem
                              key={activity.id}
                              activity={activity}
                              isLast={index === groupActivities.length - 1}
                              index={currentIndex}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <ActivityIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No activity yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Activities will appear here as you manage invoices
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
