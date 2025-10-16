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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ArrowLeft, Calendar, User, CheckCircle2, Clock, AlertTriangle, MessageSquare, Plus, Settings, Trash2, Archive, Play, Pause, Flag, X, Pencil } from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { InlineEdit } from '@/components/InlineEdit';
import { ItemNotFound } from '@/components/ItemNotFound';
import UserSelector from '@/components/UserSelector';
import MultiUserSelector from '@/components/MultiUserSelector';
import { ProgressSlider } from '@/components/ProgressSlider';
import { useUndoToast } from '@/components/UndoToast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
const statusOptions = [{
  value: 'pending',
  label: 'Pendente',
  color: 'text-gray-400',
  bg: 'bg-gray-500/10',
  icon: Clock
}, {
  value: 'in-progress',
  label: 'Em Andamento',
  color: 'text-blue-400',
  bg: 'bg-blue-500/10',
  icon: Play
}, {
  value: 'under-review',
  label: 'Em Revisão',
  color: 'text-purple-400',
  bg: 'bg-purple-500/10',
  icon: Clock
}, {
  value: 'completed',
  label: 'Concluída',
  color: 'text-green-400',
  bg: 'bg-green-500/10',
  icon: CheckCircle2
}, {
  value: 'overdue',
  label: 'Atrasada',
  color: 'text-red-400',
  bg: 'bg-red-500/10',
  icon: AlertTriangle
}];
const priorityOptions = [{
  value: 'low',
  label: 'Baixa',
  color: 'text-green-600',
  bg: 'bg-green-500/10',
  dot: 'bg-green-500'
}, {
  value: 'medium',
  label: 'Média',
  color: 'text-yellow-600',
  bg: 'bg-yellow-500/10',
  dot: 'bg-yellow-500'
}, {
  value: 'high',
  label: 'Alta',
  color: 'text-red-600',
  bg: 'bg-red-500/10',
  dot: 'bg-red-500'
}];
export default function TaskDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    tasks,
    loading: tasksLoading,
    updateTask,
    deleteTask
  } = useTasks();
  const {
    projects
  } = useProjects();
  const {
    users
  } = useLocalData();
  const {
    showUndoToast
  } = useUndoToast();
  const {
    user: currentUser
  } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [progress, setProgress] = useState(0);
  const [subtasks, setSubtasks] = useState<Array<{
    id: string;
    text: string;
    completed: boolean;
  }>>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [comments, setComments] = useState<Array<{
    id: string;
    text: string;
    author: {
      name: string;
      avatar: string | null;
      role: string;
    };
    createdAt: Date;
  }>>([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const task = tasks.find(t => t.id === id);
  const project = task?.project_id ? projects.find(p => p.id === task.project_id) : null;

  // Fetch subtasks and comments from database
  useEffect(() => {
    if (!id) return;
    const fetchSubtasks = async () => {
      try {
        setLoadingSubtasks(true);
        const {
          data,
          error
        } = await supabase.from('task_subtasks').select('*').eq('task_id', id).order('created_at', {
          ascending: true
        });
        if (error) throw error;
        setSubtasks(data || []);
      } catch (error: any) {
        console.error('Error fetching subtasks:', error);
      } finally {
        setLoadingSubtasks(false);
      }
    };
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const {
          data,
          error
        } = await supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', {
          ascending: true
        });
        if (error) throw error;

        // Fetch profiles separately
        if (data && data.length > 0) {
          const authorIds = [...new Set(data.map(c => c.author_id))];
          const {
            data: profiles,
            error: profilesError
          } = await supabase.from('profiles').select('id, name, avatar, role').in('id', authorIds);
          if (profilesError) throw profilesError;
          const formattedComments = data.map(comment => {
            const author = profiles?.find(p => p.id === comment.author_id);
            return {
              id: comment.id,
              text: comment.text,
              author: {
                name: author?.name || 'Usuário',
                avatar: author?.avatar || null,
                role: author?.role || 'Membro'
              },
              createdAt: new Date(comment.created_at)
            };
          });
          setComments(formattedComments);
        } else {
          setComments([]);
        }
      } catch (error: any) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchSubtasks();
    fetchComments();

    // Subscribe to real-time changes
    const subtasksChannel = supabase.channel('task-subtasks-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'task_subtasks',
      filter: `task_id=eq.${id}`
    }, () => {
      fetchSubtasks();
    }).subscribe();
    const commentsChannel = supabase.channel('task-comments-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'task_comments',
      filter: `task_id=eq.${id}`
    }, () => {
      fetchComments();
    }).subscribe();
    return () => {
      supabase.removeChannel(subtasksChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [id]);

  // Calculate progress based on subtasks
  useEffect(() => {
    if (task) {
      const completedSubtasks = subtasks.filter(st => st.completed).length;
      const calculatedProgress = subtasks.length > 0 ? Math.round(completedSubtasks / subtasks.length * 100) : 0;
      setProgress(calculatedProgress);
    }
  }, [subtasks, task]);
  if (tasksLoading) {
    return <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando tarefa...</p>
          </div>
        </div>
      </Layout>;
  }
  if (!task) {
    const suggestions = tasks.filter(t => t.title.toLowerCase().includes(id?.toLowerCase() || '')).slice(0, 3).map(t => ({
      id: t.id,
      name: t.title,
      link: `/tasks/${t.id}`
    }));
    return <Layout>
        <ItemNotFound type="tarefa" backLink="/tasks" backLabel="Voltar às tarefas" suggestions={suggestions} onSearch={term => {
        const found = tasks.find(t => t.title.toLowerCase().includes(term.toLowerCase()));
        if (found) {
          navigate(`/tasks/${found.id}`);
        }
      }} />
      </Layout>;
  }
  const statusConfig = statusOptions.find(s => s.value === task.status) || statusOptions[0];
  const priorityConfig = priorityOptions.find(p => p.value === task.priority) || priorityOptions[1];
  const StatusIcon = statusConfig.icon;
  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
  const handleUpdateTask = async (updates: any) => {
    try {
      await updateTask(task.id, updates);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  const handleStatusChange = (newStatus: string) => {
    handleUpdateTask({
      status: newStatus
    });
  };
  const handleMarkCompleted = () => {
    handleUpdateTask({
      status: 'completed'
    });
  };
  const handleSubtaskToggle = async (subtaskId: string) => {
    const subtask = subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;
    try {
      const {
        error
      } = await supabase.from('task_subtasks').update({
        completed: !subtask.completed
      }).eq('id', subtaskId);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating subtask:', error);
    }
  };
  const handleEditSubtask = async (subtaskId: string, newText: string) => {
    try {
      const {
        error
      } = await supabase.from('task_subtasks').update({
        text: newText
      }).eq('id', subtaskId);
      if (error) throw error;
      showUndoToast('Subtarefa atualizada', {
        message: 'O nome da subtarefa foi alterado',
        undo: async () => {}
      });
    } catch (error: any) {
      console.error('Error updating subtask:', error);
    }
  };
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const {
        error
      } = await supabase.from('task_subtasks').delete().eq('id', subtaskId);
      if (error) throw error;
      showUndoToast('Subtarefa excluída', {
        message: 'A subtarefa foi removida',
        undo: async () => {}
      });
    } catch (error: any) {
      console.error('Error deleting subtask:', error);
    }
  };
  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim() || !task) return;
    try {
      const {
        error
      } = await supabase.from('task_subtasks').insert({
        task_id: task.id,
        text: newSubtaskText.trim(),
        completed: false
      });
      if (error) throw error;
      setNewSubtaskText('');
      setShowSubtaskInput(false);
      showUndoToast('Subtarefa adicionada', {
        message: 'A subtarefa foi criada com sucesso',
        undo: async () => {}
      });
    } catch (error: any) {
      console.error('Error adding subtask:', error);
    }
  };
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser || !task) return;
    try {
      const {
        error
      } = await supabase.from('task_comments').insert({
        task_id: task.id,
        text: newComment.trim(),
        author_id: currentUser.id
      });
      if (error) throw error;
      setNewComment('');
      showUndoToast('Comentário adicionado', {
        message: 'Seu comentário foi salvo',
        undo: async () => {}
      });
    } catch (error: any) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateAssignees = async (newAssigneeIds: string[]) => {
    try {
      await updateTask(task.id, {}, newAssigneeIds);
      showUndoToast('Responsáveis atualizados', {
        message: 'A lista de responsáveis foi atualizada',
        undo: async () => {}
      });
    } catch (error: any) {
      console.error('Error updating assignees:', error);
    }
  };
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('pt-BR');
  };
  const handleDeleteTask = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      try {
        await deleteTask(task.id);
        navigate('/tasks');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };
  return <Layout>
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
                <InlineEdit value={task.title} onSave={newTitle => handleUpdateTask({
                title: newTitle
              })} className="mb-1" displayClassName="text-xl md:text-2xl font-semibold text-foreground" validation={value => value.length > 100 ? 'Título muito longo (max 100 caracteres)' : null} required />
                <p className="text-muted-foreground text-sm">
                  Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {task.status !== 'completed' && <Button onClick={handleMarkCompleted} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar como Concluída
                </Button>}
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
                        <select value={task.status} onChange={e => handleStatusChange(e.target.value)} className={cn("px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer", statusConfig.color, statusConfig.bg, "border-current/20 bg-current/5")}>
                          {statusOptions.map(option => <option key={option.value} value={option.value}>
                              {option.label}
                            </option>)}
                        </select>

                        <select value={task.priority} onChange={e => handleUpdateTask({
                        priority: e.target.value
                      })} className={cn("px-3 py-2 rounded-lg text-sm font-medium cursor-pointer", priorityConfig.color, priorityConfig.bg)}>
                          {priorityOptions.map(option => <option key={option.value} value={option.value}>
                              Prioridade {option.label}
                            </option>)}
                        </select>

                        {project && <Link to={`/projects/${project.id}`} className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline">
                            {project.name}
                          </Link>}
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Descrição</h4>
                        <InlineEdit value={task.description || ''} onSave={newDescription => handleUpdateTask({
                        description: newDescription
                      })} multiline placeholder="Adicione uma descrição para a tarefa..." displayClassName="text-muted-foreground leading-relaxed" />
                      </div>

                      <ProgressSlider value={progress} onChange={setProgress} disabled={task.status === 'completed'} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Prazo</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", isOverdue && "border-red-400 text-red-400")}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent mode="single" selected={new Date(task.due_date)} onSelect={date => {
                              if (date) {
                                handleUpdateTask({
                                  due_date: date.toISOString().split('T')[0]
                                });
                              }
                            }} initialFocus className="pointer-events-auto" />
                            </PopoverContent>
                          </Popover>
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
                        <MultiUserSelector
                          selectedUsers={task.assignees?.map(a => a.id) || []}
                          onSelectionChange={handleUpdateAssignees}
                          placeholder="Adicionar responsáveis..."
                          className="w-full"
                        />
                        
                        {task.assignees && task.assignees.length === 0 && (
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subtarefas</CardTitle>
                    <Button size="sm" className="gap-2" onClick={() => setShowSubtaskInput(true)}>
                      <Plus className="w-4 h-4" />
                      Nova Subtarefa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {showSubtaskInput && <div className="flex gap-2 p-3 bg-muted/30 rounded-lg">
                        <Textarea value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} placeholder="Descreva a subtarefa..." className="flex-1 min-h-[60px]" autoFocus onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                      if (e.key === 'Escape') {
                        setShowSubtaskInput(false);
                        setNewSubtaskText('');
                      }
                    }} />
                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskText.trim()}>
                            Adicionar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                        setShowSubtaskInput(false);
                        setNewSubtaskText('');
                      }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>}

                    {subtasks.map(subtask => <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                        <Checkbox checked={subtask.completed} onCheckedChange={() => handleSubtaskToggle(subtask.id)} />
                        <div className="flex-1 min-w-0">
                          <InlineEdit value={subtask.text} onSave={newText => handleEditSubtask(subtask.id, newText)} displayClassName={cn("text-sm", subtask.completed && "line-through text-muted-foreground")} className="text-sm" required validation={value => value.length > 200 ? 'Texto muito longo (max 200 caracteres)' : null} />
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteSubtask(subtask.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>)}
                  </div>
                  
                  {subtasks.length === 0 && !showSubtaskInput && <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Nenhuma subtarefa criada ainda
                      </p>
                      <Button size="sm" onClick={() => setShowSubtaskInput(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Subtarefa
                      </Button>
                    </div>}
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
                    <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Adicione um comentário..." className="min-h-[80px]" />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                        Adicionar Comentário
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length > 0 ? comments.map(comment => <div key={comment.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {comment.author.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-foreground">
                                  {comment.author.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {comment.author.role}
                                </span>
                                
                                
                              </div>
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        </div>) : <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                          Nenhum comentário ainda
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seja o primeiro a comentar nesta tarefa
                        </p>
                      </div>}
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
                    <Button variant="outline" onClick={() => handleUpdateTask({
                    status: 'archived'
                  })} className="gap-2">
                      <Archive className="w-4 h-4" />
                      Arquivar Tarefa
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-destructive/20">
                    <h4 className="font-medium text-destructive mb-3">Zona de Perigo</h4>
                    <Button variant="destructive" onClick={handleDeleteTask} className="gap-2">
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
    </Layout>;
}