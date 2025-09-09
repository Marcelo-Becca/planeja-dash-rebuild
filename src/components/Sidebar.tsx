import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Calendar,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "projects", label: "Projetos", icon: FolderKanban, active: false },
  { id: "tasks", label: "Tarefas", icon: CheckSquare, active: false },
  { id: "reports", label: "Relatórios", icon: BarChart3, active: false },
  { id: "teams", label: "Equipes", icon: Users, active: false },
  { id: "calendar", label: "Calendário", icon: Calendar, active: false },
];

const footerItems = [
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "logout", label: "Sair", icon: LogOut },
];

export default function Sidebar({ isCollapsed, onToggleCollapsed }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard");

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        onToggleCollapsed();
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onToggleCollapsed]);

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 relative z-20",
      isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64",
      // Mobile overlay when expanded
      !isCollapsed && "md:relative fixed inset-y-0 left-0"
    )}>
      {/* Header with brand and toggle */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">P+</span>
              </div>
              <span className="text-sidebar-primary font-semibold text-lg">Planeja+</span>
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-sidebar-foreground" />
            ) : (
              <X className="w-5 h-5 text-sidebar-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-primary" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-sidebar-primary rounded-r" />
                  )}
                  
                  <Icon className={cn(
                    "w-5 h-5 transition-colors flex-shrink-0",
                    isActive ? "text-sidebar-primary" : "group-hover:text-sidebar-primary/80"
                  )} />
                  
                  {!isCollapsed && (
                    <span className="ml-3 font-medium truncate">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <ul className="space-y-1">
          {footerItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  className="w-full flex items-center px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 group relative"
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm truncate">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}