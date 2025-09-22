import { Calendar, Filter, RotateCcw, Users, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportsFilters as ReportsFiltersType } from "@/hooks/useReportsData";
import { mockProjects, mockUsers } from "@/data/mockData";

interface ReportsFiltersProps {
  filters: ReportsFiltersType;
  onFiltersChange: (filters: Partial<ReportsFiltersType>) => void;
  onReset: () => void;
  loading: boolean;
}

export default function ReportsFilters({ filters, onFiltersChange, onReset, loading }: ReportsFiltersProps) {
  const periodOptions = [
    { value: "day", label: "Último dia" },
    { value: "week", label: "Últimos 7 dias" },
    { value: "month", label: "Mês atual" },
    { value: "quarter", label: "Trimestre atual" },
    { value: "year", label: "Ano atual" },
    { value: "custom", label: "Período personalizado" }
  ];

  const granularityOptions = [
    { value: "day", label: "Por dia" },
    { value: "week", label: "Por semana" },
    { value: "month", label: "Por mês" }
  ];

  return (
    <div className="p-4 bg-card rounded-lg border border-border animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Period Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-card-foreground">Período:</Label>
          <Select 
            value={filters.period} 
            onValueChange={(value: any) => onFiltersChange({ period: value })}
            disabled={loading}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {filters.period === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFiltersChange({ startDate: e.target.value })}
              className="w-40"
              disabled={loading}
            />
            <span className="text-muted-foreground">até</span>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFiltersChange({ endDate: e.target.value })}
              className="w-40"
              disabled={loading}
            />
          </div>
        )}

        {/* Projects Filter */}
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-card-foreground">Projetos:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48 justify-start" disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                {filters.projects.length === 0 
                  ? "Todos os projetos"
                  : `${filters.projects.length} selecionado(s)`
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selecione os projetos:</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockProjects.map(project => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={filters.projects.includes(project.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFiltersChange({ 
                              projects: [...filters.projects, project.id] 
                            });
                          } else {
                            onFiltersChange({
                              projects: filters.projects.filter(id => id !== project.id)
                            });
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`project-${project.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {project.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Members Filter */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-card-foreground">Membros:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48 justify-start" disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                {filters.members.length === 0 
                  ? "Todos os membros"
                  : `${filters.members.length} selecionado(s)`
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selecione os membros:</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={filters.members.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFiltersChange({ 
                              members: [...filters.members, user.id] 
                            });
                          } else {
                            onFiltersChange({
                              members: filters.members.filter(id => id !== user.id)
                            });
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`user-${user.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Granularity */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-card-foreground">Granularidade:</Label>
          <Select 
            value={filters.granularity} 
            onValueChange={(value: any) => onFiltersChange({ granularity: value })}
            disabled={loading}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {granularityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
          className="ml-auto"
          disabled={loading}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Redefinir
        </Button>
      </div>

      {/* Filter Summary */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Mostrando dados de <strong>{periodOptions.find(p => p.value === filters.period)?.label}</strong>
          {filters.projects.length > 0 && (
            <span> • <strong>{filters.projects.length}</strong> projeto(s) selecionado(s)</span>
          )}
          {filters.members.length > 0 && (
            <span> • <strong>{filters.members.length}</strong> membro(s) selecionado(s)</span>
          )}
        </p>
      </div>
    </div>
  );
}