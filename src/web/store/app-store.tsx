import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Types for API response
export interface ApiInvoice {
  id: number;
  invoice_number: string;
  invoice_total_amount: number;
  invoice_date: string;
  invoice_due_date: string;
  invoice_paid_amount: number;
  expected_payment_date: string;
  customer_name: string;
}

export interface ApiCustomer {
  id: number;
  customer_name: string;
  email: string | null;
  total_outstanding_amount: number;
  rating: "GOOD" | "AVERAGE" | "POOR";
}

export interface ApiTask {
  id: number;
  task_number: string;
  description: string;
  assigned_to: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  invoice_number: string;
}

// Types
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "overdue"
  | "paid"
  | "due_tomorrow";

export interface SavedInvoice {
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
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  invoiceCount: number;
  totalOutstanding: number;
  overdueCount: number;
}

export type TaskStatus = "open" | "done";

export interface Task {
  id: string;
  description: string;
  invoiceNumber?: string;
  customerName?: string;
  status: TaskStatus;
  priority?: "high" | "normal";
  createdAt: Date;
}

export type ActivityType =
  | "invoice_uploaded"
  | "ai_suggestion"
  | "email_sent"
  | "customer_reply_simulated"
  | "task_created"
  | "payment_recorded"
  | "status_changed";

export interface Activity {
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

// Initial mock data
const initialInvoices: SavedInvoice[] = [
  {
    id: "inv-001",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    amount: 45000,
    dueDate: "2024-01-15",
    status: "overdue",
    aiSuggestedAction: { type: "send_email", label: "Send Email" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 90),
  },
  {
    id: "inv-002",
    customerName: "Beta Ltd",
    invoiceNumber: "INV-2024-0845",
    amount: 12000,
    dueDate: "2024-02-01",
    status: "due_tomorrow",
    aiSuggestedAction: { type: "send_email", label: "Send Email" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    id: "inv-003",
    customerName: "TechVentures Pvt",
    invoiceNumber: "INV-2024-0839",
    amount: 78500,
    dueDate: "2024-01-20",
    status: "overdue",
    aiSuggestedAction: { type: "call_customer", label: "Call Customer" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: "inv-004",
    customerName: "Global Solutions",
    invoiceNumber: "INV-2024-0851",
    amount: 156000,
    dueDate: "2024-02-10",
    status: "sent",
    aiSuggestedAction: { type: "none", label: "No Action Needed" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
  },
  {
    id: "inv-005",
    customerName: "Sunrise Industries",
    invoiceNumber: "INV-2024-0836",
    amount: 32500,
    dueDate: "2024-01-08",
    status: "paid",
    aiSuggestedAction: { type: "none", label: "Completed" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144),
  },
  {
    id: "inv-006",
    customerName: "Metro Distributors",
    invoiceNumber: "INV-2024-0848",
    amount: 89000,
    dueDate: "2024-01-25",
    status: "overdue",
    aiSuggestedAction: { type: "send_reminder", label: "Send Reminder" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
];

const initialTasks: Task[] = [];

const initialActivities: Activity[] = [
  {
    id: "act-001",
    type: "payment_recorded",
    description: "Payment of ₹32,500 received",
    customerName: "Sunrise Industries",
    invoiceNumber: "INV-2024-0836",
    timestamp: new Date(Date.now() - 1000 * 60 * 23),
    metadata: { amount: 32500 },
  },
  {
    id: "act-002",
    type: "task_created",
    description: "Follow-up task created after customer reply simulation",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "act-003",
    type: "customer_reply_simulated",
    description: "Customer reply simulation triggered",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 47),
  },
  {
    id: "act-004",
    type: "email_sent",
    description: "Payment reminder email sent",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "act-005",
    type: "ai_suggestion",
    description: "AI recommended sending payment reminder",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 62),
    metadata: { suggestionType: "send_email" },
  },
  {
    id: "act-006",
    type: "status_changed",
    description: "Invoice status changed",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2024-0842",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    metadata: { oldStatus: "Sent", newStatus: "Overdue" },
  },
  {
    id: "act-007",
    type: "email_sent",
    description: "Payment reminder email sent",
    customerName: "Beta Ltd",
    invoiceNumber: "INV-2024-0845",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    id: "act-008",
    type: "ai_suggestion",
    description: "AI recommended sending early reminder",
    customerName: "Beta Ltd",
    invoiceNumber: "INV-2024-0845",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26.5),
    metadata: { suggestionType: "send_reminder" },
  },
  {
    id: "act-009",
    type: "invoice_uploaded",
    description: "New invoice uploaded and analyzed",
    customerName: "Global Solutions",
    invoiceNumber: "INV-2024-0851",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28),
    metadata: { amount: 156000 },
  },
  {
    id: "act-010",
    type: "payment_recorded",
    description: "Payment of ₹78,500 received",
    customerName: "TechVentures Pvt",
    invoiceNumber: "INV-2024-0839",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    metadata: { amount: 78500 },
  },
];

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Context type
interface AppContextType {
  // State
  invoices: SavedInvoice[];
  tasks: Task[];
  activities: Activity[];
  isLoading: boolean;
  apiError: string | null;
  customersLoading: boolean;
  customersError: string | null;
  tasksLoading: boolean;
  tasksError: string | null;

  // Derived state
  customers: Customer[];
  openTasksCount: number;

  // Actions
  fetchInvoices: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  addInvoice: (
    invoice: Omit<SavedInvoice, "id" | "createdAt" | "aiSuggestedAction">,
  ) => void;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  toggleTaskStatus: (taskId: string) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;

  // Compound actions (for the happy path flow)
  sendEmailForInvoice: (invoice: SavedInvoice) => void;
  simulateCustomerReply: (invoice: SavedInvoice) => void;
  markInvoiceAsPaid: (invoiceId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Derive customers from invoices
  const customers: Customer[] = (() => {
    const customerMap = new Map<string, Customer>();

    for (const invoice of invoices) {
      const existing = customerMap.get(invoice.customerName);
      const isOverdue = invoice.status === "overdue";
      const isPaid = invoice.status === "paid";
      const outstanding = isPaid ? 0 : invoice.amount;

      if (existing) {
        customerMap.set(invoice.customerName, {
          ...existing,
          invoiceCount: existing.invoiceCount + 1,
          totalOutstanding: existing.totalOutstanding + outstanding,
          overdueCount: existing.overdueCount + (isOverdue ? 1 : 0),
        });
      } else {
        customerMap.set(invoice.customerName, {
          id: `cust-${invoice.customerName.toLowerCase().replace(/\s+/g, "-")}`,
          name: invoice.customerName,
          invoiceCount: 1,
          totalOutstanding: outstanding,
          overdueCount: isOverdue ? 1 : 0,
        });
      }
    }

    return Array.from(customerMap.values());
  })();

  // Derive open tasks count
  const openTasksCount = tasks.filter((t) => t.status === "open").length;

  // Helper to convert API invoice to our format
  function convertApiInvoice(apiInvoice: ApiInvoice): SavedInvoice {
    const dueDate = new Date(apiInvoice.invoice_due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let status: InvoiceStatus;
    if (apiInvoice.invoice_paid_amount >= apiInvoice.invoice_total_amount) {
      status = "paid";
    } else if (daysUntilDue < 0) {
      status = "overdue";
    } else if (daysUntilDue <= 1) {
      status = "due_tomorrow";
    } else {
      status = "sent";
    }

    return {
      id: apiInvoice.id.toString(),
      customerName: apiInvoice.customer_name,
      invoiceNumber: apiInvoice.invoice_number,
      amount: apiInvoice.invoice_total_amount,
      dueDate: apiInvoice.invoice_due_date,
      status,
      aiSuggestedAction: determineAiAction(status, apiInvoice.invoice_due_date),
      createdAt: new Date(apiInvoice.invoice_date),
    };
  }

  // Fetch invoices from API
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("http://10.4.144.243:5000/invoices");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiInvoices: ApiInvoice[] = await response.json();
      const convertedInvoices = apiInvoices.map(convertApiInvoice);

      setInvoices(convertedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setApiError(
        error instanceof Error ? error.message : "Failed to fetch invoices",
      );
      // Fallback to initial data if API fails
      setInvoices(initialInvoices);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setCustomersError(null);

    try {
      const response = await fetch("http://10.4.144.243:5000/customers/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiCustomers: ApiCustomer[] = await response.json();

      // Convert API customers to our Customer format
      const convertedCustomers: Customer[] = apiCustomers.map(
        (apiCustomer) => ({
          id: apiCustomer.id.toString(),
          name: apiCustomer.customer_name,
          invoiceCount: 0, // Will be calculated from invoices
          totalOutstanding: apiCustomer.total_outstanding_amount,
          overdueCount: 0, // Will be calculated from invoices
        }),
      );

      // Update customers state directly (not derived from invoices)
      // For now, we'll keep the existing derived logic but could replace it
      // For simplicity, let's update the customers derivation to include API data
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomersError(
        error instanceof Error ? error.message : "Failed to fetch customers",
      );
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);

    try {
      const response = await fetch("http://10.4.144.243:5000/tasks/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiTasks: ApiTask[] = await response.json();

      // Convert API tasks to our Task format
      const convertedTasks: Task[] = apiTasks.map((apiTask) => ({
        id: apiTask.id.toString(),
        description: apiTask.description,
        invoiceNumber: apiTask.invoice_number,
        customerName: undefined, // API doesn't provide customer name
        status: "open", // API doesn't provide status, default to open
        priority: apiTask.priority.toLowerCase() === "high" ? "high" : "normal",
        createdAt: new Date(), // API doesn't provide created date
      }));

      setTasks(convertedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasksError(
        error instanceof Error ? error.message : "Failed to fetch tasks",
      );
      // Fallback to initial data if API fails
      setTasks(initialTasks);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Add invoice
  const addInvoice = useCallback(
    (invoice: Omit<SavedInvoice, "id" | "createdAt" | "aiSuggestedAction">) => {
      const newInvoice: SavedInvoice = {
        ...invoice,
        id: generateId("inv"),
        createdAt: new Date(),
        aiSuggestedAction: determineAiAction(invoice.status, invoice.dueDate),
      };

      setInvoices((prev) => [newInvoice, ...prev]);

      // Add activity for invoice upload
      const newActivity: Activity = {
        id: generateId("act"),
        type: "invoice_uploaded",
        description: "New invoice uploaded and analyzed",
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        timestamp: new Date(),
        metadata: { amount: invoice.amount },
      };
      setActivities((prev) => [newActivity, ...prev]);

      // Also add AI suggestion activity
      const suggestionActivity: Activity = {
        id: generateId("act"),
        type: "ai_suggestion",
        description: `AI recommended ${newInvoice.aiSuggestedAction.label.toLowerCase()}`,
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        timestamp: new Date(),
        metadata: { suggestionType: newInvoice.aiSuggestedAction.type },
      };
      setActivities((prev) => [suggestionActivity, ...prev]);
    },
    [],
  );

  // Update invoice status
  const updateInvoiceStatus = useCallback(
    (invoiceId: string, status: InvoiceStatus) => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status,
                aiSuggestedAction:
                  status === "paid"
                    ? { type: "none" as const, label: "Completed" }
                    : determineAiAction(status, inv.dueDate),
              }
            : inv,
        ),
      );
    },
    [],
  );

  // Add task
  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId("task"),
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  // Toggle task status
  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "done" ? "open" : "done" }
          : task,
      ),
    );
  }, []);

  // Add activity
  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "timestamp">) => {
      const newActivity: Activity = {
        ...activity,
        id: generateId("act"),
        timestamp: new Date(),
      };
      setActivities((prev) => [newActivity, ...prev]);
    },
    [],
  );

  // Send email for invoice (compound action)
  const sendEmailForInvoice = useCallback(
    (invoice: SavedInvoice) => {
      addActivity({
        type: "email_sent",
        description: "Payment reminder email sent",
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
      });
    },
    [addActivity],
  );

  // Simulate customer reply (compound action)
  const simulateCustomerReply = useCallback(
    (invoice: SavedInvoice) => {
      // Add customer reply simulation activity
      addActivity({
        type: "customer_reply_simulated",
        description: "Customer reply simulation triggered",
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
      });

      // Create a task
      const newTask: Task = {
        id: generateId("task"),
        description: "Fix invoice issue raised by customer",
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        status: "open",
        priority: "high",
        createdAt: new Date(),
      };
      setTasks((prev) => [newTask, ...prev]);

      // Add task creation activity
      addActivity({
        type: "task_created",
        description: "Follow-up task created after customer reply simulation",
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
      });
    },
    [addActivity],
  );

  // Mark invoice as paid (compound action)
  const markInvoiceAsPaid = useCallback(
    (invoiceId: string) => {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return;

      // Update invoice status
      updateInvoiceStatus(invoiceId, "paid");

      // Add payment activity
      addActivity({
        type: "payment_recorded",
        description: `Payment of ₹${invoice.amount.toLocaleString("en-IN")} received`,
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        metadata: { amount: invoice.amount },
      });
    },
    [invoices, updateInvoiceStatus, addActivity],
  );

  const value: AppContextType = {
    invoices,
    tasks,
    activities,
    isLoading,
    apiError,
    customersLoading,
    customersError,
    tasksLoading,
    tasksError,
    customers,
    openTasksCount,
    fetchInvoices,
    fetchCustomers,
    fetchTasks,
    addInvoice,
    updateInvoiceStatus,
    addTask,
    toggleTaskStatus,
    addActivity,
    sendEmailForInvoice,
    simulateCustomerReply,
    markInvoiceAsPaid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}

// Helper to determine AI action based on status
function determineAiAction(
  status: InvoiceStatus,
  dueDate: string,
): SavedInvoice["aiSuggestedAction"] {
  const due = new Date(dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (status === "paid") {
    return { type: "none", label: "Completed" };
  }
  if (status === "overdue" || daysUntilDue < 0) {
    return { type: "send_email", label: "Send Email" };
  }
  if (status === "due_tomorrow" || daysUntilDue <= 1) {
    return { type: "send_email", label: "Send Email" };
  }
  if (daysUntilDue <= 7) {
    return { type: "send_reminder", label: "Send Reminder" };
  }
  return { type: "none", label: "No Action Needed" };
}
