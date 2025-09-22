import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DetailedTask } from "@/hooks/useReportsData";

interface DetailsPanelProps {
  isOpen: boolean;
  title: string;
  tasks: DetailedTask[];
  onClose: () => void;
  onTaskClick?: (taskId: string) => void;
}

export default function DetailsPanel({ isOpen, title, tasks, onClose, onTaskClick }: DetailsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof DetailedTask; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedTasks.length / itemsPerPage);
  const paginatedTasks = processedTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof DetailedTask) => {
    setSortConfig(prev => ({
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

  const SortableHeader = ({ column, children }: { column: keyof DetailedTask; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {title}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Search and Info */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {processedTasks.length} de {tasks.length} tarefas
            </div>
          </div>

          {/* Table */}
          {processedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">
                {searchQuery ? "Nenhuma tarefa encontrada" : "Sem tarefas para exibir"}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader column="title">Tarefa</SortableHeader>
                      <SortableHeader column="project">Projeto</SortableHeader>
                      <SortableHeader column="assignee">Responsável</SortableHeader>
                      <SortableHeader column="status">Status</SortableHeader>
                      <SortableHeader column="createdAt">Criada em</SortableHeader>
                      <SortableHeader column="deadline">Prazo</SortableHeader>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTasks.map((task) => (
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
                        <TableCell className="text-sm">{task.assignee}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell className="text-sm">{task.createdAt}</TableCell>
                        <TableCell className="text-sm">{task.deadline}</TableCell>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}