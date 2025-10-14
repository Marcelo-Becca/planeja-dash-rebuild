import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvitationButton } from '@/components/invitation/InvitationButton';
import CreateTaskModal from '@/components/CreateTaskModal';
import { MultiTeamSelector } from '@/components/MultiTeamSelector';
import { ArrowLeft, Edit3, Calendar as CalendarIcon, Users, CheckCircle2, Clock, Plus, Trash2, Activity, Target, Settings, User } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { useAuth } from '@/contexts/AuthContext';
import { InlineEdit } from '@/components/InlineEdit';
import { ItemNotFound } from '@/components/ItemNotFound';
import UserSelector from '@/components/UserSelector';
import { useUndoToast } from '@/components/UndoToast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
const statusOptions = [{
  value: 'active',
  label: 'Ativo',
  color: 'text-blue-400',
  bg: 'bg-blue-500/10'
}, {
  value: 'completed',
  label: 'Concluído',
  color: 'text-green-400',
  bg: 'bg-green-500/10'
}, {
  value: 'on-hold',
  label: 'Pausado',
  color: 'text-yellow-400',
  bg: 'bg-yellow-500/10'
}, {
  value: 'archived',
  label: 'Arquivado',
  color: 'text-gray-400',
  bg: 'bg-gray-500/10'
}];
export default function ProjectDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    teams,
    updateProject,
    deleteProject,
    updateTask,
    users
  } = useLocalData();
  const {
    user
  } = useAuth();
  const {
    showUndoToast
  } = useUndoToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isManagingTeams, setIsManagingTeams] = useState(false);
  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(task => task.projectId === id);

  // Calculate real-time progress
  const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

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
    const suggestions = projects.filter(p => p.name.toLowerCase().includes(id?.toLowerCase() || '')).slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      link: `/projects/${p.id}`
    }));
    return <Layout>
        <ItemNotFound type="projeto" backLink="/projects" backLabel="Voltar aos projetos" suggestions={suggestions} onSearch={term => {
        const found = projects.find(p => p.name.toLowerCase().includes(term.toLowerCase()));
        if (found) {
          navigate(`/projects/${found.id}`);
        }
      }} />
      </Layout>;
  }
  const statusConfig = statusOptions.find(s => s.value === project.status) || statusOptions[0];
  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';
  const handleUpdateProject = (updates: any) => {
    const originalData = {
      ...project
    };
    updateProject(project.id, updates);
    showUndoToast('Projeto atualizado', {
      message: 'As alterações foram salvas',
      undo: () => updateProject(project.id, originalData)
    });
  };
  const handleStatusChange = (newStatus: string) => {
    const originalStatus = project.status;
    handleUpdateProject({
      status: newStatus
    });
    if (newStatus === 'completed' && originalStatus !== 'completed') {
      // Mark all tasks as completed when project is completed
      projectTasks.forEach(task => {
        if (task.status !== 'completed') {
          updateTask(task.id, {
            status: 'completed'
          });
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
  return <Layout>
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
                <InlineEdit value={project.name} onSave={newName => handleUpdateProject({
                name: newName
              })} className="mb-1" displayClassName="text-xl md:text-2xl font-semibold text-foreground" validation={value => value.length > 50 ? 'Nome muito longo (max 50 caracteres)' : null} required />
                <p className="text-muted-foreground text-sm">
                  Criado por {project.createdBy?.name || 'Sistema'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <InvitationButton target={{
              type: 'project',
              id: project.id,
              name: project.name
            }} currentUser={user as any} variant="outline" size="sm" />
              
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
              <TabsTrigger value="team">Equipes ({project.teams?.length || 0})</TabsTrigger>
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
                    <select value={project.status} onChange={e => handleStatusChange(e.target.value)} className={cn("px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer", statusConfig.color, statusConfig.bg, "border-current/20 bg-current/5")}>
                      {statusOptions.map(option => <option key={option.value} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span className={cn("font-medium", isOverdue && "text-red-400")}>
                        Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <InlineEdit value={project.description || ''} onSave={newDescription => handleUpdateProject({
                    description: newDescription
                  })} multiline placeholder="Adicione uma descrição para o projeto..." displayClassName="text-muted-foreground leading-relaxed" />
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
                    <div className="text-2xl font-bold text-blue-500">{project.teams?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Equipes</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tarefas do Projeto</CardTitle>
                    <Button size="sm" className="gap-2" onClick={() => setIsCreateTaskModalOpen(true)}>
                      <Plus className="w-4 h-4" />
                      Nova Tarefa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projectTasks.map(task => {
                    const taskStatus = {
                      pending: {
                        color: "text-gray-400",
                        bg: "bg-gray-500/10",
                        label: "Pendente"
                      },
                      "in-progress": {
                        color: "text-blue-400",
                        bg: "bg-blue-500/10",
                        label: "Em Andamento"
                      },
                      completed: {
                        color: "text-green-400",
                        bg: "bg-green-500/10",
                        label: "Concluída"
                      },
                      overdue: {
                        color: "text-red-400",
                        bg: "bg-red-500/10",
                        label: "Atrasada"
                      },
                      "under-review": {
                        color: "text-purple-400",
                        bg: "bg-purple-500/10",
                        label: "Em Revisão"
                      }
                    }[task.status] || {
                      color: "text-gray-400",
                      bg: "bg-gray-500/10",
                      label: "Desconhecido"
                    };
                    return <Link key={task.id} to={`/tasks/${task.id}`} className="block p-4 border border-border rounded-lg hover:border-primary/20 hover:bg-muted/30 transition-all group">
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
                              <Badge variant="secondary" className={cn(taskStatus.color, taskStatus.bg)}>
                                {taskStatus.label}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {new Date(task.deadline).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </Link>;
                  })}
                  </div>

                  {projectTasks.length === 0 && <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Nenhuma tarefa criada ainda
                      </p>
                      <Button size="sm" onClick={() => setIsCreateTaskModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Tarefa
                      </Button>
                    </div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              {/* Project Teams Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Equipes do Projeto ({project.teams?.length || 0})
                    </CardTitle>
                    <Button size="sm" className="gap-2" onClick={() => setIsManagingTeams(!isManagingTeams)}>
                      <Plus className="w-4 h-4" />
                      {isManagingTeams ? 'Concluir' : 'Gerenciar Equipes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Team Management Section */}
                  {isManagingTeams && <div className="p-4 bg-muted/30 rounded-lg border animate-in fade-in-50 slide-in-from-top-2">
                      <h4 className="font-medium mb-3">Adicionar ou Remover Equipes</h4>
                      <MultiTeamSelector teams={teams} selectedTeamIds={project.teams?.map(t => t.id) || []} onSelectionChange={teamIds => {
                    const selectedTeams = teams.filter(t => teamIds.includes(t.id));
                    handleUpdateProject({
                      teams: selectedTeams
                    });
                  }} placeholder="Selecione as equipes para este projeto" />
                      <p className="text-xs text-muted-foreground mt-3">
                        As equipes selecionadas terão acesso ao projeto e suas tarefas.
                      </p>
                    </div>}

                  {/* Teams Display */}
                  {project.teams && project.teams.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.teams.map(team => <div key={team.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-all group" style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: team.color
                  }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{
                          backgroundColor: `${team.color}20`,
                          color: team.color
                        }}>
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground truncate">
                                  {team.name}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {team.description || team.objective}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {team.members.length} membro(s)
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {team.status === 'active' ? 'Ativa' : 'Arquivada'}
                              </Badge>
                            </div>
                          </div>

                          {/* Team Members Preview */}
                          <div className="flex items-center gap-1 mt-3">
                            {team.members.slice(0, 5).map(member => <Avatar key={member.id} className="w-7 h-7 border-2 border-background">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {member.user.avatar}
                                </AvatarFallback>
                              </Avatar>)}
                            {team.members.length > 5 && <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                +{team.members.length - 5}
                              </div>}
                          </div>
                        </div>)}
                    </div> : <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium mb-2">Nenhuma equipe associada</h4>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                        Adicione equipes ao projeto para facilitar a colaboração e organização das tarefas
                      </p>
                      <Button size="sm" onClick={() => setIsManagingTeams(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Primeira Equipe
                      </Button>
                    </div>}
                </CardContent>
              </Card>

              {/* Individual Members Section (Legacy) */}
              {project.team && project.team.length > 0 && <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Membros Individuais ({project.team.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.team.map((member, index) => <div key={member.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {member.name}
                              {index === 0 && <Badge variant="secondary" className="ml-2 text-xs">
                                  Líder
                                </Badge>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.role}
                            </p>
                          </div>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>}
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
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="project-name" className="text-sm font-medium">
                      Nome do Projeto
                    </Label>
                    <Input id="project-name" value={project.name} onChange={e => handleUpdateProject({
                    name: e.target.value
                  })} placeholder="Nome do projeto" className="max-w-md" />
                  </div>

                  {/* Project Deadline */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium block">
                      Prazo Final
                    </Label>
                    <div className="max-w-md">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {project.deadline ? format(new Date(project.deadline), "PPP", {
                            locale: ptBR
                          }) : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={new Date(project.deadline)} onSelect={date => {
                          if (date) {
                            handleUpdateProject({
                              deadline: date
                            });
                          }
                        }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Project Category */}
                  <div className="space-y-2">
                    <Label htmlFor="project-category" className="text-sm font-medium">
                      Categoria
                    </Label>
                    <Select value={(project as any).category || ''} onValueChange={value => handleUpdateProject({
                    category: value
                  })}>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Vendas">Vendas</SelectItem>
                        <SelectItem value="Operações">Operações</SelectItem>
                        <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Leader */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Líder do Projeto
                    </Label>
                    <Select value={project.createdBy?.id || ''} onValueChange={userId => {
                    const newLeader = users.find(u => u.id === userId);
                    if (newLeader) {
                      handleUpdateProject({
                        createdBy: newLeader
                      });
                    }
                  }}>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Selecione o líder" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name} - {user.role}</span>
                            </div>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-6 border-t border-destructive/20">
                    <h4 className="font-medium text-destructive mb-3">Zona de Perigo</h4>
                    <Button variant="destructive" onClick={handleDeleteProject} className="gap-2">
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

      <CreateTaskModal open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen} preselectedProjectId={project.id} />
    </Layout>;
}