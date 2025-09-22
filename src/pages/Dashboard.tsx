import Layout from "@/components/Layout";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalData } from "@/hooks/useLocalData";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, CheckCircle, Clock, FolderOpen, Users, Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import CreateProjectModal from "@/components/CreateProjectModal";
import CreateTaskModal from "@/components/CreateTaskModal";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, tasks, teams } = useLocalData();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Statistics
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const activeProjects = projects.filter(project => project.status === 'active').length;
  const completedProjects = projects.filter(project => project.status === 'completed').length;
  const activeTeams = teams.filter(team => team.status === 'active').length;

  const hasData = projects.length > 0 || tasks.length > 0 || teams.length > 0;

  if (!hasData) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Bem-vindo ao Planeja+, {user?.displayName || user?.name}! 👋
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Você está a poucos passos de organizar seus projetos e maximizar sua produtividade.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsCreateProjectOpen(true)}>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Criar seu primeiro projeto</CardTitle>
                  <CardDescription>
                    Organize suas ideias em projetos estruturados
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsCreateTaskOpen(true)}>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Adicionar primeira tarefa</CardTitle>
                  <CardDescription>
                    Comece listando o que precisa ser feito
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setIsCreateProjectOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Criar Projeto
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsCreateTaskOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Criar Tarefa
              </Button>
            </div>
          </div>
        </div>

        <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
        <CreateTaskModal open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o progresso dos seus projetos e tarefas
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {completedProjects} concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingTasks + inProgressTasks} pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressTasks}</div>
                <p className="text-xs text-muted-foreground">
                  tarefas ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipes Ativas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTeams}</div>
                <p className="text-xs text-muted-foreground">
                  colaborando
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projetos Recentes</CardTitle>
                  <Link to="/projects">
                    <Button variant="outline" size="sm">Ver todos</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{project.progress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {project.completedTasks}/{project.tasksCount} tarefas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Tasks */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tarefas Recentes</CardTitle>
                  <Link to="/tasks">
                    <Button variant="outline" size="sm">Ver todas</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {task.status === 'completed' ? 'Concluída' :
                           task.status === 'in-progress' ? 'Em andamento' :
                           task.status === 'pending' ? 'Pendente' : 'Atrasada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}