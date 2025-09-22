import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, X, CheckCircle } from 'lucide-react';
import { CalendarFilters as CalendarFiltersType } from '@/types/calendar';
import { useLocalData } from '@/hooks/useLocalData';

interface CalendarFiltersProps {
  filters: CalendarFiltersType;
  onFiltersChange: (filters: Partial<CalendarFiltersType>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CalendarFilters({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: CalendarFiltersProps) {
  const { projects, teams, users } = useLocalData();
  const [isOpen, setIsOpen] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.projects.length > 0) count++;
    if (filters.teams.length > 0) count++;
    if (filters.participants.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.showMyEventsOnly) count++;
    return count;
  };

  const clearAllFilters = () => {
    onFiltersChange({
      projects: [],
      teams: [],
      participants: [],
      types: [],
      priorities: [],
      showMyEventsOnly: false,
    });
  };

  const toggleFilter = <T,>(
    filterArray: T[],
    value: T,
    filterKey: keyof CalendarFiltersType
  ) => {
    const newArray = filterArray.includes(value)
      ? filterArray.filter(item => item !== value)
      : [...filterArray, value];
    
    onFiltersChange({ [filterKey]: newArray });
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="flex items-center space-x-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-64"
        />
      </div>

      {/* Filters Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs" variant="secondary">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent>
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Filtros do Calendário</SheetTitle>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 text-xs"
                >
                  Limpar tudo
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* My Events Only */}
            <div className="flex items-center justify-between">
              <Label htmlFor="my-events">Apenas meus eventos</Label>
              <Switch
                id="my-events"
                checked={filters.showMyEventsOnly}
                onCheckedChange={(checked) => onFiltersChange({ showMyEventsOnly: checked })}
              />
            </div>

            {/* Projects */}
            <div className="space-y-2">
              <Label>Projetos</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFilter(filters.projects, project.id, 'projects')}
                      className="flex items-center space-x-2 w-full text-left p-2 rounded hover:bg-accent"
                    >
                      {filters.projects.includes(project.id) ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 border rounded" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-2">
              <Label>Equipes</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFilter(filters.teams, team.id, 'teams')}
                      className="flex items-center space-x-2 w-full text-left p-2 rounded hover:bg-accent"
                    >
                      {filters.teams.includes(team.id) ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 border rounded" />
                      )}
                      <span className="truncate">{team.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Types */}
            <div className="space-y-2">
              <Label>Tipos de Evento</Label>
              <div className="space-y-1">
                {[
                  { value: 'meeting', label: 'Reunião' },
                  { value: 'deadline', label: 'Entrega' },
                  { value: 'reminder', label: 'Lembrete' },
                  { value: 'block', label: 'Bloqueio' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => toggleFilter(filters.types, type.value as any, 'types')}
                    className="flex items-center space-x-2 w-full text-left p-2 rounded hover:bg-accent"
                  >
                    {filters.types.includes(type.value as any) ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 border rounded" />
                    )}
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priorities */}
            <div className="space-y-2">
              <Label>Prioridades</Label>
              <div className="space-y-1">
                {[
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' }
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => toggleFilter(filters.priorities, priority.value as any, 'priorities')}
                    className="flex items-center space-x-2 w-full text-left p-2 rounded hover:bg-accent"
                  >
                    {filters.priorities.includes(priority.value as any) ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 border rounded" />
                    )}
                    <span>{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active filters display */}
      {activeCount > 0 && (
        <div className="flex items-center space-x-1">
          {filters.showMyEventsOnly && (
            <Badge variant="secondary" className="text-xs">
              Meus eventos
              <button
                onClick={() => onFiltersChange({ showMyEventsOnly: false })}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}