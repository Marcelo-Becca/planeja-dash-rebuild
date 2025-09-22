import { useAuth } from "@/contexts/AuthContext";

interface UserProfileProps {
  isCollapsed: boolean;
}

export default function UserProfile({ isCollapsed }: UserProfileProps) {
  const { user } = useAuth();

  if (!user) return null;

  // Generate avatar initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      {/* Profile Display - Non-interactive */}
      <div className="w-full flex items-center p-3 rounded-lg bg-sidebar-accent/20 transition-colors group">
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sidebar-primary-foreground font-semibold text-xs">
            {user.avatar || getInitials(user.name)}
          </span>
        </div>

        {!isCollapsed && (
          <div className="ml-3 flex-1 text-left">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.displayName || user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.role || 'Usuário'}
            </p>
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {user.displayName || user.name}
          </div>
        )}
      </div>
    </div>
  );
}