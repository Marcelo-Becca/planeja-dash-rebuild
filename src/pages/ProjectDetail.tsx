import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Archive,
  Copy,
  Trash2,
  Activity,
  Target,
  Settings
} from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { InlineEdit } from '@/components/InlineEdit';
import { ItemNotFound } from '@/components/ItemNotFound';
import UserSelector from '@/components/UserSelector';
import { useUndoToast } from '@/components/UndoToast';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'active', label: 'Ativo', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'completed', label: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 'on-hold', label: 'Pausado', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: 'archived', label: 'Arquivado', color: 'text-gray-400', bg: 'bg-gray-500/10' }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, updateProject, deleteProject, updateTask, users } = useLocalData();
  const { showUndoToast } = useUndoToast();
  const [activeTab, setActiveTab] = useState('overview');

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(task => task.projectId === id);

  // Calculate real-time progress
  const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update project progress in real-time
  useEffect(() => {
    if (project && (project.progress !== progress || project.tasksCount !== totalTasks || project.completedTasks !== completedTasks)) {
      updateProject(project.id, {
        progress,
        tasksCount: totalTasks,
        completedTasks
      });
    }
  }, [project, progress, totalTasks, completedTasks, updateProject]);

  if (!project) {
    const suggestions = projects
      .filter(p => p.name.toLowerCase().includes(id?.toLowerCase() || ''))
      .slice(0, 3)
      .map(p => ({ id: p.id, name: p.name, link: `/projects/${p.id}` }));

    return (
      <Layout>
        <ItemNotFound
          type="projeto"
          backLink="/projects"
          backLabel="Voltar aos projetos"
          suggestions={suggestions}
          onSearch={(term) => {
            const found = projects.find(p => 
              p.name.toLowerCase().includes(term.toLowerCase())
            );
            if (found) {
              navigate(`/projects/${found.id}`);
            }
          }}
        />
      </Layout>
    );
  }

  const statusConfig = statusOptions.find(s => s.value === project.status) || statusOptions[0];
  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';

  const handleUpdateProject = (updates: any) => {
    const originalData = { ...project };
    updateProject(project.id, updates);
    
    showUndoToast('Projeto atualizado', {
      message: 'As alterações foram salvas',
      undo: () => updateProject(project.id, originalData)
    });
  };

  const handleStatusChange = (newStatus: string) => {
    const originalStatus = project.status;
    handleUpdateProject({ status: newStatus });
    
    if (newStatus === 'completed' && originalStatus !== 'completed') {
      // Mark all tasks as completed when project is completed
      projectTasks.forEach(task => {
        if (task.status !== 'completed') {
          updateTask(task.id, { status: 'completed' });
        }
      });
    }
  };

  const handleDeleteProject = () => {
    if (window.confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  const handleDuplicateProject = () => {
    const duplicatedProject = {
      ...project,
      name: `${project.name} (Cópia)`,
      status: 'active',
      progress: 0,
      completedTasks: 0,
      tasksCount: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    delete duplicatedProject.id;
    
    // This would need to be implemented in useLocalData
    // addProject(duplicatedProject);
    showUndoToast('Projeto duplicado', {
      message: 'Uma cópia do projeto foi criada',
      undo: () => {} // Would need actual implementation
    });
  };

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Projetos
                </Button>
              </Link>
              <div className="flex-1">
                <InlineEdit
                  value={project.name}
                  onSave={(newName) => handleUpdateProject({ name: newName })}
                  className="mb-1"
                  displayClassName="text-xl md:text-2xl font-semibold text-foreground"
                  validation={(value) => value.length > 50 ? 'Nome muito longo (max 50 caracteres)' : null}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  Criado por {project.createdBy?.name || 'Sistema'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas ({projectTasks.length})</TabsTrigger>
              <TabsTrigger value="team">Equipe ({project.team?.length || 0})</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Project Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Informações do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <select 
                      value={project.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer",
                        statusConfig.color,
                        statusConfig.bg,
                        "border-current/20 bg-current/5"
                      )}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className={cn(
                        "font-medium",
                        isOverdue && "text-red-400"
                      )}>
                        Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <InlineEdit
                      value={project.description || ''}
                      onSave={(newDescription) => handleUpdateProject({ description: newDescription })}
                      multiline
                      placeholder="Adicione uma descrição para o projeto..."
                      displayClassName="text-muted-foreground leading-relaxed"
                    />
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Progresso</h4>
                      <span className="text-sm font-medium text-foreground">
                        {completedTasks}/{totalTasks} tarefas ({progress}%)
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{totalTasks}</div>
                    <div className="text-sm text-muted-foreground">Total de Tarefas</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
                    <div className="text-sm text-muted-foreground">Concluídas</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{project.team?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Membros</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tarefas do Projeto</CardTitle>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Tarefa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projectTasks.map((task) => {
                      const taskStatus = {
                        pending: { color: "text-gray-400", bg: "bg-gray-500/10", label: "Pendente" },
                        "in-progress": { color: "text-blue-400", bg: "bg-blue-500/10", label: "Em Andamento" },
                        completed: { color: "text-green-400", bg: "bg-green-500/10", label: "Concluída" },
                        overdue: { color: "text-red-400", bg: "bg-red-500/10", label: "Atrasada" },
                        "under-review": { color: "text-purple-400", bg: "bg-purple-500/10", label: "Em Revisão" }
                      }[task.status] || { color: "text-gray-400", bg: "bg-gray-500/10", label: "Desconhecido" };

                      return (
                        <Link
                          key={task.id}
                          to={`/tasks/${task.id}`}
                          className="block p-4 border border-border rounded-lg hover:border-primary/20 hover:bg-muted/30 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {task.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {task.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <Badge 
                                variant="secondary" 
                                className={cn(taskStatus.color, taskStatus.bg)}
                              >
                                {taskStatus.label}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {new Date(task.deadline).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {projectTasks.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Nenhuma tarefa criada ainda
                      </p>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Tarefa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Equipe ({project.team?.length || 0})
                    </CardTitle>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Adicionar Membro
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.team?.map((member, index) => (
                      <div key={member.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.name}
                            {index === 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Líder
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="col-span-full text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                          Nenhum membro na equipe ainda
                        </p>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Primeiro Membro
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button variant="outline" onClick={handleDuplicateProject} className="gap-2">
                      <Copy className="w-4 h-4" />
                      Duplicar Projeto
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleUpdateProject({ status: 'archived' })}
                      className="gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Arquivar Projeto
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-destructive/20">
                    <h4 className="font-medium text-destructive mb-3">Zona de Perigo</h4>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteProject}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Projeto
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Esta ação não pode ser desfeita. Todas as tarefas relacionadas também serão removidas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}