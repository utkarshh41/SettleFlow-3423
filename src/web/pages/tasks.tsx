import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Square,
  FileText,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TaskStatus = "open" | "done";

interface Task {
  id: string;
  description: string;
  invoiceNumber?: string;
  customerName?: string;
  status: TaskStatus;
  priority?: "high" | "normal";
  createdAt: Date;
}

// Mock tasks data
const initialTasks: Task[] = [
  {
    id: "task-001",
    description: "Fix invoice issue raised by customer",
    invoiceNumber: "INV-2024-0842",
    customerName: "Acme Corp",
    status: "open",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "task-002",
    description: "Follow up on customer reply",
    invoiceNumber: "INV-2024-0845",
    customerName: "Beta Ltd",
    status: "open",
    priority: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "task-003",
    description: "Call customer regarding overdue payment",
    invoiceNumber: "INV-2024-0848",
    customerName: "Metro Distributors",
    status: "open",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "task-004",
    description: "Review payment discrepancy",
    invoiceNumber: "INV-2024-0839",
    customerName: "TechVentures Pvt",
    status: "done",
    priority: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "task-005",
    description: "Send updated invoice with corrections",
    invoiceNumber: "INV-2024-0851",
    customerName: "Global Solutions",
    status: "done",
    priority: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: "task-006",
    description: "Verify bank transfer details with customer",
    invoiceNumber: "INV-2024-0836",
    customerName: "Sunrise Industries",
    status: "done",
    priority: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
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

function TaskItem({
  task,
  onToggle,
  index,
}: {
  task: Task;
  onToggle: (id: string) => void;
  index: number;
}) {
  const isDone = task.status === "done";

  return (
    <Card
      className={cn(
        "p-4 border transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2",
        isDone
          ? "bg-muted/30 border-border/50"
          : "hover:border-primary/40 hover:shadow-sm"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationDuration: "350ms" }}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          className={cn(
            "mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
            isDone
              ? "bg-fintech-success/10 text-fintech-success"
              : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                "text-sm font-medium",
                isDone ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {task.description}
            </span>
            {task.priority === "high" && !isDone && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 bg-fintech-danger/10 text-fintech-danger border-fintech-danger/20"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                High
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.customerName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                <span>{task.customerName}</span>
              </div>
            )}
            {task.invoiceNumber && (
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                <span className="font-mono">{task.invoiceNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(task.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-xs font-medium",
            isDone
              ? "bg-fintech-success/10 text-fintech-success border-fintech-success/20"
              : "bg-amber-100 text-amber-700 border-amber-200"
          )}
        >
          {isDone ? "Done" : "Open"}
        </Badge>
      </div>
    </Card>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "done" ? "open" : "done" }
          : task
      )
    );
  };

  const openTasks = tasks.filter((t) => t.status === "open");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Tasks
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage follow-ups and collection activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700">
              <CheckSquare className="w-4 h-4" />
              <span className="text-sm font-medium">{openTasks.length} Open</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Open Tasks */}
            {openTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Open Tasks
                  <span className="text-muted-foreground">({openTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {openTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {doneTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-fintech-success" />
                  Completed
                  <span>({doneTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {doneTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      index={index + openTasks.length}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No tasks yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tasks will appear here when created from invoice actions
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
