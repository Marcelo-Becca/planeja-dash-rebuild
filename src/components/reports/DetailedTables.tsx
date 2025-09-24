import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Download, ExternalLink, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailedTaskForReports, TeamProductivityData } from "@/types/reports";

interface DetailedTablesProps {
  tasks: DetailedTaskForReports[];
  teamProductivityData: TeamProductivityData[];
  loading?: boolean;
  onTaskClick?: (taskId: string) => void;
  onExportTasks?: () => void;
  onExportTeams?: () => void;
}

export default function DetailedTables({
  tasks,
  teamProductivityData,
  loading = false,
  onTaskClick,
  onExportTasks,
  onExportTeams
}: DetailedTablesProps) {
  const [taskSearch, setTaskSearch] = useState("");
  const [taskSortConfig, setTaskSortConfig] = useState<{ key: keyof DetailedTaskForReports; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  });
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>("all");

  const [teamSearch, setTeamSearch] = useState("");
  const [teamSortConfig, setTeamSortConfig] = useState<{ key: keyof TeamProductivityData; direction: 'asc' | 'desc' }>({
    key: 'completedTasks',
    direction: 'desc'
  });

  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (taskSearch) {
      filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(taskSearch.toLowerCase()) ||
        task.project.toLowerCase().includes(taskSearch.toLowerCase()) ||
        task.assignee.toLowerCase().includes(taskSearch.toLowerCase())
      );
    }

    // Status filter
    if (taskStatusFilter !== "all") {
      filtered = filtered.filter(task => task.status === taskStatusFilter);
    }

    // Priority filter
    if (taskPriorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === taskPriorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[taskSortConfig.key];
      const bValue = b[taskSortConfig.key];
      
      if (aValue < bValue) return taskSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return taskSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, taskSearch, taskSortConfig, taskStatusFilter, taskPriorityFilter]);

  // Filter and sort teams
  const processedTeams = useMemo(() => {
    let filtered = teamProductivityData;

    // Search filter
    if (teamSearch) {
      filtered = teamProductivityData.filter(team =>
        team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
        team.members.some(member => member.toLowerCase().includes(teamSearch.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[teamSortConfig.key];
      const bValue = b[teamSortConfig.key];
      
      if (aValue < bValue) return teamSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return teamSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [teamProductivityData, teamSearch, teamSortConfig]);

  const handleTaskSort = (key: keyof DetailedTaskForReports) => {
    setTaskSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTeamSort = (key: keyof TeamProductivityData) => {
    setTeamSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      "in-progress": "secondary",
      pending: "outline",
      overdue: "destructive"
    } as const;

    const labels = {
      completed: "Concluída",
      "in-progress": "Em andamento",
      pending: "Pendente",
      overdue: "Atrasada"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline"
    } as const;

    const labels = {
      high: "Alta",
      medium: "Média",
      low: "Baixa"
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const SortableHeader = ({ 
    column, children, onClick 
  }: { 
    column: string; 
    children: React.ReactNode; 
    onClick: () => void;
  }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">Tabelas Detalhadas</h2>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tarefas Filtradas</TabsTrigger>
          <TabsTrigger value="teams">Produtividade das Equipes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tarefas ({processedTasks.length} de {tasks.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onExportTasks}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="in-progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={taskPriorityFilter} onValueChange={setTaskPriorityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                {(taskStatusFilter !== "all" || taskPriorityFilter !== "all" || taskSearch) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTaskStatusFilter("all");
                      setTaskPriorityFilter("all");
                      setTaskSearch("");
                    }}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {processedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-2">
                    {taskSearch || taskStatusFilter !== "all" || taskPriorityFilter !== "all"
                      ? "Nenhuma tarefa encontrada com os filtros aplicados"
                      : "Sem tarefas para exibir"
                    }
                  </p>
                  {(taskSearch || taskStatusFilter !== "all" || taskPriorityFilter !== "all") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setTaskSearch("");
                        setTaskStatusFilter("all");
                        setTaskPriorityFilter("all");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader column="title" onClick={() => handleTaskSort('title')}>
                          Tarefa
                        </SortableHeader>
                        <SortableHeader column="project" onClick={() => handleTaskSort('project')}>
                          Projeto
                        </SortableHeader>
                        <SortableHeader column="team" onClick={() => handleTaskSort('team')}>
                          Equipe
                        </SortableHeader>
                        <SortableHeader column="assignee" onClick={() => handleTaskSort('assignee')}>
                          Responsável
                        </SortableHeader>
                        <SortableHeader column="priority" onClick={() => handleTaskSort('priority')}>
                          Prioridade
                        </SortableHeader>
                        <SortableHeader column="status" onClick={() => handleTaskSort('status')}>
                          Status
                        </SortableHeader>
                        <SortableHeader column="createdAt" onClick={() => handleTaskSort('createdAt')}>
                          Criada em
                        </SortableHeader>
                        <SortableHeader column="deadline" onClick={() => handleTaskSort('deadline')}>
                          Prazo
                        </SortableHeader>
                        <TableHead>Tempo Gasto</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedTasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {task.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{task.project}</TableCell>
                          <TableCell className="text-sm">{task.team || "—"}</TableCell>
                          <TableCell className="text-sm">{task.assignee}</TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell className="text-sm">{task.createdAt}</TableCell>
                          <TableCell className="text-sm">{task.deadline}</TableCell>
                          <TableCell className="text-sm">
                            {task.timeSpent ? `${task.timeSpent} dias` : "—"}
                          </TableCell>
                          <TableCell>
                            {onTaskClick && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onTaskClick(task.id)}
                                className="h-auto p-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtividade das Equipes ({processedTeams.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onExportTeams}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
              
              {/* Search */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipes..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {processedTeams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-2">
                    {teamSearch ? "Nenhuma equipe encontrada" : "Sem equipes para exibir"}
                  </p>
                  {teamSearch && (
                    <Button variant="outline" size="sm" onClick={() => setTeamSearch("")}>
                      Limpar busca
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader column="name" onClick={() => handleTeamSort('name')}>
                          Equipe
                        </SortableHeader>
                        <TableHead>Membros</TableHead>
                        <SortableHeader column="completedTasks" onClick={() => handleTeamSort('completedTasks')}>
                          Concluídas
                        </SortableHeader>
                        <SortableHeader column="inProgressTasks" onClick={() => handleTeamSort('inProgressTasks')}>
                          Em Andamento
                        </SortableHeader>
                        <SortableHeader column="overdueTasks" onClick={() => handleTeamSort('overdueTasks')}>
                          Atrasadas
                        </SortableHeader>
                        <SortableHeader column="avgTasksPerMember" onClick={() => handleTeamSort('avgTasksPerMember')}>
                          Média por Membro
                        </SortableHeader>
                        <TableHead>% Conclusão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedTeams.map((team) => {
                        const totalTasks = team.completedTasks + team.inProgressTasks + team.overdueTasks;
                        const completionRate = totalTasks > 0 ? Math.round((team.completedTasks / totalTasks) * 100) : 0;
                        
                        return (
                          <TableRow key={team.teamId} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{team.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {team.members.length} membros
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {team.members.slice(0, 2).join(", ")}
                                {team.members.length > 2 && (
                                  <span className="text-muted-foreground">
                                    {" "}e mais {team.members.length - 2}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">{team.completedTasks}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{team.inProgressTasks}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{team.overdueTasks}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {team.avgTasksPerMember.toFixed(1)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{completionRate}%</div>
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-chart-1 transition-all duration-300"
                                    style={{ width: `${completionRate}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}