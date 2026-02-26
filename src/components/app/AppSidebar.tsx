import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, FolderOpen, GitBranch, FileText, Target,
  BarChart2, Heart, Bot, Settings, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/projects", icon: FolderOpen, label: "Projects" },
  { href: "/app/workflow", icon: GitBranch, label: "Workflow" },
  { href: "/app/documents", icon: FileText, label: "Documents" },
  { href: "/app/goals", icon: Target, label: "Goals" },
  { href: "/app/productivity", icon: BarChart2, label: "Productivity" },
  { href: "/app/wellness", icon: Heart, label: "Wellness" },
  { href: "/app/ai", icon: Bot, label: "AI Assistant" },
  { href: "/app/settings", icon: Settings, label: "Settings" },
];

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const initials = user?.user_metadata?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border h-16">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-sidebar-foreground truncate">VirexOS</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location.pathname === href;
            return (
              <Link key={href} to={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            {theme === "dark" ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-xs gradient-hero text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.user_metadata?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-full top-1/2 -translate-y-1/2 -translate-x-0 w-5 h-10 bg-sidebar border border-sidebar-border rounded-r-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
          style={{ marginLeft: "-1px" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
