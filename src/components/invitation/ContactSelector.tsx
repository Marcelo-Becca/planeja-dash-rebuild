import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CircleContact } from '@/types/invitation';

interface ContactSelectorProps {
  onSelect: (contact: CircleContact | null) => void;
  selectedContact?: CircleContact | null;
  placeholder?: string;
  disabled?: boolean;
}

// Mock circle contacts - in a real app, this would come from an API or contacts system
import { mockUsers } from '@/data/mockData';

const mockCircleContacts: CircleContact[] = mockUsers.map(user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  department: user.role.includes('Manager') ? 'Gestão' : 
             user.role.includes('Developer') || user.role.includes('Tech') ? 'Desenvolvimento' :
             user.role.includes('Designer') ? 'Design' :
             user.role.includes('QA') || user.role.includes('Analyst') ? 'Qualidade' :
             user.role.includes('DevOps') ? 'Infraestrutura' : 'Geral',
  company: 'Planeja+'
}));

export function ContactSelector({ 
  onSelect, 
  selectedContact, 
  placeholder = "Selecionar do círculo...",
  disabled = false 
}: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<CircleContact[]>([]);

  useEffect(() => {
  // Simulate loading contacts from circle/network
  // In a real app, this would be an API call
  setContacts(mockCircleContacts);
  }, []);

  const handleSelect = (contact: CircleContact) => {
    onSelect(selectedContact?.id === contact.id ? null : contact);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedContact ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="text-xs">
                    {selectedContact.avatar || selectedContact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{selectedContact.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedContact.role}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar contato..." />
            <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {contacts.map((contact) => (
                <CommandItem
                  key={contact.id}
                  value={`${contact.name} ${contact.email} ${contact.role}`}
                  onSelect={() => handleSelect(contact)}
                  className="flex items-center gap-3 p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="text-xs">
                      {contact.avatar || contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.name}</span>
                      {contact.role && (
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contact.email}
                    </div>
                    {contact.company && (
                      <div className="text-xs text-muted-foreground">
                        {contact.company} • {contact.department}
                      </div>
                    )}
                  </div>

                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedContact?.id === contact.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedContact && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Contato do círculo • Primeiro grau</span>
        </div>
      )}
    </div>
  );
}