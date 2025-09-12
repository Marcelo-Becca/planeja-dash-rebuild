import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Phone,
  Calendar,
  Users,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { mockTeams, mockTasks } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function TeamDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const team = mockTeams.find(t => t.id === id);

  if (!team) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto p-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Equipe não encontrada</h2>
            <Link to="/teams">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar às equipes
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const teamTasks = mockTasks.filter(task => 
    task.assignedTo.some(user => 
      team.members.some(member => member.user.id === user.id)
    )
  );

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

  const handleEditTeam = () => {
    toast({
      title: "Editando equipe",
      description: "Abrindo editor da equipe...",
    });
  };

  const handleAddMember = () => {
    toast({
      title: "Adicionando membro",
      description: "Abrindo seletor de membros...",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container max-w-6xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link to="/teams">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{team.name}</h1>
                  <Badge 
                    variant="secondary" 
                    className={team.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-muted text-muted-foreground'
                    }
                  >
                    {team.status === 'active' ? 'Ativa' : 'Arquivada'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{team.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleEditTeam} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar Equipe
              </Button>
              <Button onClick={handleAddMember}>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Membro
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Team Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informações da Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Objetivo</h4>
                      <p className="text-sm text-muted-foreground">{team.objective}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Membros</span>
                        <p className="font-medium">{team.members.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projetos</span>
                        <p className="font-medium">{team.projects.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criada em</span>
                        <p className="font-medium">{team.createdAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Líder</span>
                        <p className="font-medium">{team.leader.name}</p>
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
                      {team.projects.map((project) => (
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {activity.performedBy.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              por {activity.performedBy.name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Membros da Equipe ({team.members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{member.user.name}</h4>
                              {member.role === 'leader' && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  <Crown className="mr-1 h-3 w-3" />
                                  Líder
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.user.role}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.user.email}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Desde {member.joinedAt.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{member.tasksCount} tarefas</p>
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
                    ))}
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
                                Prazo: {task.deadline.toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Responsáveis: {task.assignedTo.map(u => u.name).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className={
                            task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            task.status === 'overdue' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            'bg-primary/10 text-primary border-primary/20'
                          }
                        >
                          {task.status === 'completed' ? 'Concluída' :
                           task.status === 'in-progress' ? 'Em Andamento' :
                           task.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                    
                    {teamTasks.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nenhuma tarefa vinculada a esta equipe.</p>
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