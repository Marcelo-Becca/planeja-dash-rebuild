import Layout from "@/components/Layout";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { mockTasks } from "@/data/mockData";
import { useState } from "react";

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                Tarefas
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Acompanhe e gerencie todas as suas tarefas
              </p>
            </div>
            
            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-foreground"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="in-progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="overdue">Atrasada</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-foreground"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou criar uma nova tarefa
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </Layout>
  );
}