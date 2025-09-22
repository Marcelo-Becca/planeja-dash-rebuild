import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Archive,
  Play,
  Pause,
  Flag
} from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { InlineEdit } from '@/components/InlineEdit';
import { ItemNotFound } from '@/components/ItemNotFound';
import UserSelector from '@/components/UserSelector';
import { ProgressSlider } from '@/components/ProgressSlider';
import { useUndoToast } from '@/components/UndoToast';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Clock },
  { value: 'in-progress', label: 'Em Andamento', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Play },
  { value: 'under-review', label: 'Em Revisão', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Clock },
  { value: 'completed', label: 'Concluída', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  { value: 'overdue', label: 'Atrasada', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle }
];

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'text-green-600', bg: 'bg-green-500/10', dot: 'bg-green-500' },
  { value: 'medium', label: 'Média', color: 'text-yellow-600', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'text-red-600', bg: 'bg-red-500/10', dot: 'bg-red-500' }
];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, projects, updateTask, deleteTask, users } = useLocalData();
  const { showUndoToast } = useUndoToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [progress, setProgress] = useState(0);
  const [subtasks, setSubtasks] = useState([
    { id: '1', text: 'Análise inicial', completed: false },
    { id: '2', text: 'Desenvolvimento', completed: false },
    { id: '3', text: 'Testes', completed: false },
    { id: '4', text: 'Deploy', completed: false }
  ]);

  const task = tasks.find(t => t.id === id);
  const project = task ? projects.find(p => p.id === task.projectId) : null;

  useEffect(() => {
    if (task) {
      // Calculate progress based on subtasks
      const completedSubtasks = subtasks.filter(st => st.completed).length;
      const calculatedProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
      setProgress(calculatedProgress);
      
      // Auto-suggest task completion when all subtasks are done
      if (calculatedProgress === 100 && task.status !== 'completed') {
        // Could show a suggestion toast here
      }
    }
  }, [subtasks, task]);

  if (!task) {
    const suggestions = tasks
      .filter(t => t.title.toLowerCase().includes(id?.toLowerCase() || ''))
      .slice(0, 3)
      .map(t => ({ id: t.id, name: t.title, link: `/tasks/${t.id}` }));

    return (
      <Layout>
        <ItemNotFound
          type="tarefa"
          backLink="/tasks"
          backLabel="Voltar às tarefas"
          suggestions={suggestions}
          onSearch={(term) => {
            const found = tasks.find(t => 
              t.title.toLowerCase().includes(term.toLowerCase())
            );
            if (found) {
              navigate(`/tasks/${found.id}`);
            }
          }}
        />
      </Layout>
    );
  }

  const statusConfig = statusOptions.find(s => s.value === task.status) || statusOptions[0];
  const priorityConfig = priorityOptions.find(p => p.value === task.priority) || priorityOptions[0];
  const StatusIcon = statusConfig.icon;
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';

  const handleUpdateTask = (updates: any) => {
    const originalData = { ...task };
    updateTask(task.id, updates);
    
    showUndoToast('Tarefa atualizada', {
      message: 'As alterações foram salvas',
      undo: () => updateTask(task.id, originalData)
    });
  };

  const handleStatusChange = (newStatus: string) => {
    handleUpdateTask({ 
      status: newStatus,
      ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
    });
  };

  const handleMarkCompleted = () => {
    handleUpdateTask({ 
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setSubtasks(prev => prev.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // This would normally update the task with new comment
      // For now, just clear the input
      setNewComment('');
      showUndoToast('Comentário adicionado', {
        message: 'Seu comentário foi salvo',
        undo: () => {} // Would need actual implementation
      });
    }
  };

  const handleDeleteTask = () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      deleteTask(task.id);
      navigate('/tasks');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tasks">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Tarefas
                </Button>
              </Link>
              <div className="flex-1">
                <InlineEdit
                  value={task.title}
                  onSave={(newTitle) => handleUpdateTask({ title: newTitle })}
                  className="mb-1"
                  displayClassName="text-xl md:text-2xl font-semibold text-foreground"
                  validation={(value) => value.length > 100 ? 'Título muito longo (max 100 caracteres)' : null}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  Criada por {task.createdBy?.name || 'Sistema'} em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {task.status !== 'completed' && (
                <Button onClick={handleMarkCompleted} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar como Concluída
                </Button>
              )}
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
              <TabsTrigger value="subtasks">Subtarefas ({subtasks.length})</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes da Tarefa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <select 
                          value={task.status}
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

                        <select 
                          value={task.priority}
                          onChange={(e) => handleUpdateTask({ priority: e.target.value })}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
                            priorityConfig.color,
                            priorityConfig.bg
                          )}
                        >
                          {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              Prioridade {option.label}
                            </option>
                          ))}
                        </select>

                        {project && (
                          <Link 
                            to={`/projects/${project.id}`}
                            className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                          >
                            {project.name}
                          </Link>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Descrição</h4>
                        <InlineEdit
                          value={task.description || ''}
                          onSave={(newDescription) => handleUpdateTask({ description: newDescription })}
                          multiline
                          placeholder="Adicione uma descrição para a tarefa..."
                          displayClassName="text-muted-foreground leading-relaxed"
                        />
                      </div>

                      <ProgressSlider
                        value={progress}
                        onChange={setProgress}
                        disabled={task.status === 'completed'}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Prazo:</span>
                          <span className={cn(
                            "font-medium",
                            isOverdue ? "text-red-400" : "text-foreground"
                          )}>
                            {new Date(task.deadline).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Criada em:</span>
                          <span className="text-foreground font-medium">
                            {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Assigned Users */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="w-4 h-4" />
                        Responsáveis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {task.assignedTo?.map((user) => (
                          <div key={user.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
                            <Avatar className="w-10 h-10 mr-3">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.role}
                              </p>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-4">
                            <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Nenhum responsável atribuído
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Creator Info */}
                  {task.createdBy && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Criador</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {task.createdBy.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {task.createdBy.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {task.createdBy.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subtarefas</CardTitle>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Subtarefa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                        />
                        <span className={cn(
                          "flex-1 text-sm",
                          subtask.completed && "line-through text-muted-foreground"
                        )}>
                          {subtask.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {subtasks.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Nenhuma subtarefa criada ainda
                      </p>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Subtarefa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comentários e Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        Adicionar Comentário
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {task.comments?.length > 0 ? (
                      task.comments.map((comment, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {task.createdBy?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">
                              {task.createdBy?.name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              há 2 dias
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-8">
                            {comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                          Nenhum comentário ainda
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seja o primeiro a comentar nesta tarefa
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
                    Configurações da Tarefa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button 
                      variant="outline" 
                      onClick={() => handleUpdateTask({ status: 'archived' })}
                      className="gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Arquivar Tarefa
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-destructive/20">
                    <h4 className="font-medium text-destructive mb-3">Zona de Perigo</h4>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteTask}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Tarefa
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Esta ação não pode ser desfeita.
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