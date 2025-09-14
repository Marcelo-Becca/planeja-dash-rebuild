import { useState } from "react";
import { Settings, User, LogOut, ChevronUp } from "lucide-react";
import { currentUser } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface UserProfileProps {
  isCollapsed: boolean;
}

export default function UserProfile({ isCollapsed }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 group",
          isOpen && "bg-sidebar-accent/50"
        )}
        aria-label="Menu do perfil"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sidebar-primary-foreground font-semibold text-xs">
            {currentUser.avatar}
          </span>
        </div>

        {!isCollapsed && (
          <>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {currentUser.role}
              </p>
            </div>
            <ChevronUp 
              className={cn(
                "w-4 h-4 text-sidebar-foreground/60 transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {currentUser.name}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isCollapsed && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <div className="py-1">
            <button className="w-full flex items-center px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/70 transition-colors">
              <User className="w-4 h-4 mr-3" />
              Meu Perfil
            </button>
            <Link 
              to="/settings" 
              className="w-full flex items-center px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/70 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </Link>
            <div className="border-t border-sidebar-border my-1" />
            <button className="w-full flex items-center px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/70 transition-colors">
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}