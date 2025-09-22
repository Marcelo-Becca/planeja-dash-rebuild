import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, FolderPlus } from "lucide-react";
import { useLocalData } from "@/hooks/useLocalData";
import { useState } from "react";

export default function Projects() {
  const { projects } = useLocalData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                Projetos
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gerencie todos os seus projetos em um só lugar
              </p>
            </div>
            
            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar projetos..."
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
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="on-hold">Pausado</option>
              </select>
            </div>
          </div>

          {/* Projects Grid or Empty State */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<FolderPlus className="w-8 h-8" />}
              title="Nenhum projeto criado ainda"
              description="Comece criando seu primeiro projeto para organizar suas tarefas e colaborar com sua equipe."
              actionLabel="Criar primeiro projeto"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="Nenhum projeto encontrado"
              description="Nenhum projeto corresponde aos filtros aplicados. Tente ajustar sua busca ou filtros."
            />
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </Layout>
  );
}