import { useState } from "react";
import { Calendar, Filter, RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ReportFilters } from "@/types/reports";

interface ComprehensiveReportsFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  onReset: () => void;
  loading?: boolean;
  filterOptions: {
    projects: { id: string; name: string }[];
    teams: { id: string; name: string }[];
    members: { id: string; name: string }[];
  };
}

export default function ComprehensiveReportsFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  loading = false,
  filterOptions
}: ComprehensiveReportsFiltersProps) {
  const [projectSearch, setProjectSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const periodOptions = [
    { value: "day", label: "Último dia" },
    { value: "week", label: "Últimos 7 dias" },
    { value: "month", label: "Mês atual" },
    { value: "quarter", label: "Trimestre atual" },
    { value: "year", label: "Ano atual" },
    { value: "custom", label: "Período personalizado" }
  ];

  const statusOptions = [
    { value: "all", label: "Todos os status" },
    { value: "pending", label: "Pendentes" },
    { value: "in-progress", label: "Em andamento" },
    { value: "completed", label: "Concluídas" },
    { value: "overdue", label: "Atrasadas" }
  ];

  const granularityOptions = [
    { value: "day", label: "Por dia" },
    { value: "week", label: "Por semana" },
    { value: "month", label: "Por mês" }
  ];

  const handleMultiSelectChange = (
    key: 'projects' | 'teams' | 'members',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[key];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({ [key]: newValues });
  };

  const clearSelection = (key: 'projects' | 'teams' | 'members') => {
    onFiltersChange({ [key]: [] });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.projects.length > 0) count++;
    if (filters.teams.length > 0) count++;
    if (filters.members.length > 0) count++;
    if (filters.status !== 'all') count++;
    if (filters.period === 'custom' && filters.startDate && filters.endDate) count++;
    return count;
  };

  const getFilterSummary = () => {
    const parts = [];
    
    // Period
    const periodLabel = periodOptions.find(p => p.value === filters.period)?.label || "";
    parts.push(periodLabel);
    
    // Selected filters
    if (filters.projects.length > 0) {
      parts.push(`${filters.projects.length} projeto(s)`);
    }
    if (filters.teams.length > 0) {
      parts.push(`${filters.teams.length} equipe(s)`);
    }
    if (filters.members.length > 0) {
      parts.push(`${filters.members.length} membro(s)`);
    }
    if (filters.status !== 'all') {
      const statusLabel = statusOptions.find(s => s.value === filters.status)?.label || "";
      parts.push(statusLabel);
    }
    
    return parts.join(" • ");
  };

  const filteredProjects = filterOptions.projects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTeams = filterOptions.teams.filter(t => 
    t.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredMembers = filterOptions.members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main filters row */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
        {/* Period selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="period" className="text-sm font-medium">Período:</Label>
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

        {/* Custom date range */}
        {filters.period === "custom" && (
          <>
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate" className="text-sm">De:</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => onFiltersChange({ startDate: e.target.value })}
                className="w-36"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate" className="text-sm">Até:</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => onFiltersChange({ endDate: e.target.value })}
                className="w-36"
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* Projects selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start gap-2" disabled={loading}>
              <Filter className="w-4 h-4" />
              Projetos
              {filters.projects.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.projects.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Projetos</Label>
                {filters.projects.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSelection('projects')}
                    className="h-auto p-1 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projetos..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Nenhum projeto encontrado
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={filters.projects.includes(project.id)}
                      onCheckedChange={(checked) => 
                        handleMultiSelectChange('projects', project.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`project-${project.id}`} 
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {project.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Teams selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start gap-2" disabled={loading}>
              <Filter className="w-4 h-4" />
              Equipes
              {filters.teams.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.teams.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Equipes</Label>
                {filters.teams.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSelection('teams')}
                    className="h-auto p-1 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipes..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredTeams.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Nenhuma equipe encontrada
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50">
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={filters.teams.includes(team.id)}
                      onCheckedChange={(checked) => 
                        handleMultiSelectChange('teams', team.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`team-${team.id}`} 
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {team.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Members selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start gap-2" disabled={loading}>
              <Filter className="w-4 h-4" />
              Membros
              {filters.members.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.members.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Membros</Label>
                {filters.members.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSelection('members')}
                    className="h-auto p-1 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar membros..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Nenhum membro encontrado
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={filters.members.includes(member.id)}
                      onCheckedChange={(checked) => 
                        handleMultiSelectChange('members', member.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`member-${member.id}`} 
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {member.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="status" className="text-sm">Status:</Label>
          <Select
            value={filters.status}
            onValueChange={(value: any) => onFiltersChange({ status: value })}
            disabled={loading}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Granularity selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="granularity" className="text-sm">Granularidade:</Label>
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

        {/* Reset button */}
        <Button
          variant="outline"
          onClick={onReset}
          disabled={loading || getActiveFiltersCount() === 0}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar filtros
        </Button>
      </div>

      {/* Filter summary */}
      {getFilterSummary() && (
        <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
          <strong>Filtros ativos:</strong> {getFilterSummary()}
        </div>
      )}
    </div>
  );
}