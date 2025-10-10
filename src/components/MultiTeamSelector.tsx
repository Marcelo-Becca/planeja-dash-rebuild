import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Team } from '@/data/mockData';

interface MultiTeamSelectorProps {
  teams: Team[];
  selectedTeamIds: string[];
  onSelectionChange: (teamIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiTeamSelector({
  teams,
  selectedTeamIds,
  onSelectionChange,
  placeholder = "Selecione equipes...",
  disabled = false
}: MultiTeamSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedTeams = teams.filter(team => selectedTeamIds.includes(team.id));

  const toggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      onSelectionChange(selectedTeamIds.filter(id => id !== teamId));
    } else {
      onSelectionChange([...selectedTeamIds, teamId]);
    }
  };

  const removeTeam = (teamId: string) => {
    onSelectionChange(selectedTeamIds.filter(id => id !== teamId));
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {selectedTeams.length > 0
                ? `${selectedTeams.length} equipe(s) selecionada(s)`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar equipe..." />
            <CommandEmpty>Nenhuma equipe encontrada.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {teams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.id);
                return (
                  <CommandItem
                    key={team.id}
                    value={team.name}
                    onSelect={() => toggleTeam(team.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{team.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {team.members.length} membro(s)
                        </p>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected teams display */}
      {selectedTeams.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTeams.map((team) => (
            <Badge
              key={team.id}
              variant="secondary"
              className="gap-2 pr-1 pl-3 py-1.5 animate-in fade-in-50 zoom-in-95"
              style={{
                backgroundColor: `${team.color}15`,
                borderColor: `${team.color}40`,
                color: team.color
              }}
            >
              <span className="font-medium">{team.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTeam(team.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover {team.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
