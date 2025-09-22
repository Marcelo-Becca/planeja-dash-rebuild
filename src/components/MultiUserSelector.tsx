import { useState } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocalData } from "@/hooks/useLocalData";

interface MultiUserSelectorProps {
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiUserSelector({ 
  selectedUsers, 
  onSelectionChange, 
  placeholder = "Selecionar participantes...",
  className 
}: MultiUserSelectorProps) {
  const [open, setOpen] = useState(false);
  const { users } = useLocalData();

  const selectedUserObjects = selectedUsers.map(id => 
    users.find(user => user.id === id)
  ).filter(Boolean);

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  };

  const removeUser = (userId: string) => {
    onSelectionChange(selectedUsers.filter(id => id !== userId));
  };

  return (
    <div className="space-y-2">
      {/* Selected users display */}
      {selectedUserObjects.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUserObjects.map((user) => (
            <Badge key={user?.id} variant="secondary" className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                {user?.avatar}
              </div>
              <span className="text-xs">{user?.name}</span>
              <button
                type="button"
                onClick={() => removeUser(user?.id || '')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* User selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {selectedUsers.length > 0 
                  ? `${selectedUsers.length} participante${selectedUsers.length !== 1 ? 's' : ''} selecionado${selectedUsers.length !== 1 ? 's' : ''}`
                  : placeholder
                }
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar usuário..." />
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => toggleUser(user.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                      {user.avatar}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role}</span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedUsers.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}