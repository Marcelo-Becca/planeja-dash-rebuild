import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Edit, 
  UserPlus, 
  MoreVertical, 
  Crown, 
  Mail, 
  Calendar,
  Users,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  Archive,
  Trash2,
  Target
} from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { InlineEdit } from '@/components/InlineEdit';
import { ItemNotFound } from '@/components/ItemNotFound';
import UserSelector from '@/components/UserSelector';
import { useUndoToast } from '@/components/UndoToast';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'active', label: 'Ativa', color: 'text-green-500', bg: 'bg-green-500/10' },
  { value: 'inactive', label: 'Inativa', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  { value: 'archived', label: 'Arquivada', color: 'text-orange-500', bg: 'bg-orange-500/10' }
];

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teams, tasks, projects, updateTeam, deleteTeam, users } = useLocalData();
  const { showUndoToast } = useUndoToast();
  const [activeTab, setActiveTab] = useState('overview');

  const team = teams.find(t => t.id === id);
  
  // Get tasks associated with team members
  const teamTasks = tasks.filter(task => 
    task.assignedTo?.some(user => 
      team?.members?.some(member => member.user?.id === user.id)
    )
  );

  // Get projects associated with the team
  const teamProjects = projects.filter(project =>
    project.team?.some(member => 
      team?.members?.some(tmember => tmember.user?.id === member.id)
    )
  );

  if (!team) {
    const suggestions = teams
      .filter(t => t.name.toLowerCase().includes(id?.toLowerCase() || ''))
      .slice(0, 3)
      .map(t => ({ id: t.id, name: t.name, link: `/teams/${t.id}` }));

    return (
      <Layout>
        <ItemNotFound
          type="equipe"
          backLink="/teams"
          backLabel="Voltar às equipes"
          suggestions={suggestions}
          onSearch={(term) => {
            const found = teams.find(t => 
              t.name.toLowerCase().includes(term.toLowerCase())
            );
            if (found) {
              navigate(`/teams/${found.id}`);
            }
          }}
        />
      </Layout>
    );
  }

  const statusConfig = statusOptions.find(s => s.value === team.status) || statusOptions[0];

  const handleUpdateTeam = (updates: any) => {
    const originalData = { ...team };
    updateTeam(team.id, updates);
    
    showUndoToast('Equipe atualizada', {
      message: 'As alterações foram salvas',
      undo: () => updateTeam(team.id, originalData)
    });
  };

  const handleDeleteTeam = () => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita.')) {
      deleteTeam(team.id);
      navigate('/teams');
    }
  };

  const handleAddMember = () => {
    // This would open a modal to select and add a new member
    showUndoToast('Membro adicionado', {
      message: 'Novo membro foi adicionado à equipe',
      undo: () => {} // Would need actual implementation
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in-progress': return 'Em Andamento';
      case 'overdue': return 'Atrasada';
      case 'under-review': return 'Em Revisão';
      default: return 'Pendente';
    }
  };

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/teams">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Equipes
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <InlineEdit
                    value={team.name}
                    onSave={(newName) => handleUpdateTeam({ name: newName })}
                    displayClassName="text-xl md:text-2xl font-semibold text-foreground"
                    validation={(value) => value.length > 50 ? 'Nome muito longo (max 50 caracteres)' : null}
                    required
                  />
                  <select 
                    value={team.status}
                    onChange={(e) => handleUpdateTeam({ status: e.target.value })}
                    className={cn(
                      "px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer",
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
                </div>
                <InlineEdit
                  value={team.description || ''}
                  onSave={(newDescription) => handleUpdateTeam({ description: newDescription })}
                  placeholder="Adicione uma descrição para a equipe..."
                  displayClassName="text-muted-foreground"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Editar Equipe
              </Button>
              <Button onClick={handleAddMember} size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Adicionar Membro
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
              <TabsTrigger value="members">Membros ({team.members?.length || 0})</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas ({teamTasks.length})</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Team Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Informações da Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Objetivo</h4>
                      <InlineEdit
                        value={team.objective || ''}
                        onSave={(newObjective) => handleUpdateTeam({ objective: newObjective })}
                        multiline
                        placeholder="Adicione o objetivo da equipe..."
                        displayClassName="text-sm text-muted-foreground"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
                      <div>
                        <span className="text-muted-foreground">Membros</span>
                        <p className="font-medium">{team.members?.length || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projetos</span>
                        <p className="font-medium">{teamProjects.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criada em</span>
                        <p className="font-medium">{new Date(team.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Líder</span>
                        <p className="font-medium">{team.leader?.name || 'Não definido'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      Projetos Associados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <Link 
                              to={`/projects/${project.id}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {project.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <Badge variant="secondary">
                            {project.progress}%
                          </Badge>
                        </div>
                      ))}
                      
                      {teamProjects.length === 0 && (
                        <div className="text-center py-6">
                          <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Nenhum projeto associado ainda
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{teamTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Total de Tarefas</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {teamTasks.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Concluídas</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {teamTasks.filter(t => t.status === 'in-progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Em Andamento</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {teamTasks.filter(t => t.status === 'overdue').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Atrasadas</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Membros da Equipe ({team.members?.length || 0})</CardTitle>
                    <Button size="sm" onClick={handleAddMember} className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Adicionar Membro
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.members?.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.user?.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{member.user?.name}</h4>
                              {member.role === 'leader' && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  <Crown className="mr-1 h-3 w-3" />
                                  Líder
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.user?.role}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.user?.email}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Desde {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{member.tasksCount || 0} tarefas</p>
                            <p className="text-xs text-muted-foreground">Em andamento</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Alterar Função
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Crown className="mr-2 h-4 w-4" />
                                Transferir Liderança
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Remover da Equipe
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                          Nenhum membro na equipe ainda
                        </p>
                        <Button onClick={handleAddMember}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Adicionar Primeiro Membro
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas Vinculadas ({teamTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <Link 
                              to={`/tasks/${task.id}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {task.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Responsáveis: {task.assignedTo?.map(u => u.name).join(', ') || 'Não atribuído'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            task.status === 'completed' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            task.status === 'overdue' && 'bg-destructive/10 text-destructive border-destructive/20',
                            task.status === 'in-progress' && 'bg-primary/10 text-primary border-primary/20'
                          )}
                        >
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                    ))}
                    
                    {teamTasks.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Nenhuma tarefa vinculada a esta equipe.
                        </p>
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
                    Configurações da Equipe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button 
                      variant="outline" 
                      onClick={() => handleUpdateTeam({ status: 'archived' })}
                      className="gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Arquivar Equipe
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-destructive/20">
                    <h4 className="font-medium text-destructive mb-3">Zona de Perigo</h4>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteTeam}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Equipe
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Esta ação não pode ser desfeita. Todos os dados da equipe serão removidos permanentemente.
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