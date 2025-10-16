import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvitationButton } from '@/components/invitation/InvitationButton';
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
import { useTeams } from '@/hooks/useTeams';
import { useLocalData } from '@/hooks/useLocalData';
import { useAuth } from '@/contexts/AuthContext';
import { InlineEdit } from '@/components/InlineEdit';
import { ItemNotFound } from '@/components/ItemNotFound';
import MultiUserSelector from '@/components/MultiUserSelector';
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
  const { teams, updateTeam, deleteTeam } = useTeams();
  const { tasks, projects, users } = useLocalData();
  const { user } = useAuth();
  const { showUndoToast } = useUndoToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

  const team = teams.find(t => t.id === id);
  
  // Get team members
  const teamMembers = users.filter(user => team?.members?.includes(user.id));
  const teamLeader = users.find(user => user.id === team?.leader_id);

  // Get tasks associated with team members
  const teamTasks = tasks.filter(task => 
    task.assignedTo?.some(assignedUser => 
      team?.members?.includes(assignedUser.id)
    )
  );

  // Get projects associated with the team
  const teamProjects = projects.filter(project =>
    project.team?.some(member => 
      team?.members?.includes(member.id)
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

  const handleUpdateTeam = async (updates: any) => {
    await updateTeam(team.id, updates);
  };

  const handleDeleteTeam = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita.')) {
      await deleteTeam(team.id);
      navigate('/teams');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro da equipe?')) {
      const updatedMembers = team.members?.filter(id => id !== userId) || [];
      await handleUpdateTeam({ members: updatedMembers });
    }
  };

  const handleAddMembers = async () => {
    if (selectedNewMembers.length === 0) return;

    const currentMembers = team.members || [];
    const newMembers = selectedNewMembers.filter(userId => 
      !currentMembers.includes(userId)
    );

    if (newMembers.length > 0) {
      await handleUpdateTeam({ members: [...currentMembers, ...newMembers] });
      setSelectedNewMembers([]);
    }
  };

  const handleChangeLeader = async (newLeaderId: string) => {
    if (window.confirm('Tem certeza que deseja alterar o líder desta equipe?')) {
      await handleUpdateTeam({ leader_id: newLeaderId });
    }
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
              <InvitationButton
                target={{
                  type: 'team',
                  id: team.id,
                  name: team.name
                }}
                currentUser={user as any}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="members">Membros ({teamMembers.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas ({teamTasks.length})</TabsTrigger>
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
                      <h4 className="font-medium mb-2">Objetivo Principal</h4>
                      <InlineEdit
                        value={team.main_objective || ''}
                        onSave={(newObjective) => handleUpdateTeam({ main_objective: newObjective })}
                        multiline
                        placeholder="Adicione o objetivo da equipe..."
                        displayClassName="text-sm text-muted-foreground"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
                      <div>
                        <span className="text-muted-foreground">Membros</span>
                        <p className="font-medium">{teamMembers.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projetos</span>
                        <p className="font-medium">{teamProjects.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criada em</span>
                        <p className="font-medium">{new Date(team.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Líder</span>
                        <p className="font-medium">{teamLeader?.name || 'Não definido'}</p>
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
                <CardHeader className="flex flex-col space-y-4">
                  <CardTitle>Membros da Equipe ({teamMembers.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <MultiUserSelector
                        selectedUsers={selectedNewMembers}
                        onSelectionChange={setSelectedNewMembers}
                        placeholder="Selecionar membros para adicionar..."
                        className="w-full"
                      />
                    </div>
                    <Button 
                      onClick={handleAddMembers}
                      disabled={selectedNewMembers.length === 0}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Adicionar {selectedNewMembers.length > 0 && `(${selectedNewMembers.length})`}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{member.name}</h4>
                              {member.id === team.leader_id && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  <Crown className="mr-1 h-3 w-3" />
                                  Líder
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            {member.email && (
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.id !== team.leader_id && (
                              <DropdownMenuItem 
                                onClick={() => handleChangeLeader(member.id)}
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Tornar Líder
                              </DropdownMenuItem>
                            )}
                            {member.id !== team.leader_id && (
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                    
                    {teamMembers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Nenhum membro nesta equipe ainda.
                        </p>
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

          </Tabs>
        </div>
      </div>
    </Layout>
  );
}