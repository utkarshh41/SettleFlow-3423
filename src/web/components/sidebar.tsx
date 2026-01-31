import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  CheckSquare,
  Activity,
  Sparkles,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/store/app-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const [location] = useLocation();
  const { openTasksCount } = useAppStore();

  const mainNavItems: NavItem[] = [
    { label: "Invoices", href: "/", icon: FileText, badge: undefined },
    { label: "Customers", href: "/customers", icon: Users },
    {
      label: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      badge: openTasksCount,
    },
    { label: "Activity", href: "/activity", icon: Activity },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
              SettleFlow
            </span>
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
              B2B Collections
            </span>
          </div>
        </div>

        <Separator className="mx-4 w-auto" />

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "nav-item group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px]",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary/70",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          isActive ? "font-medium" : "font-normal",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div className="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                        <Icon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary/70" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="mt-4 pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  AB
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Anirudh Bharghawa
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Collections Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
