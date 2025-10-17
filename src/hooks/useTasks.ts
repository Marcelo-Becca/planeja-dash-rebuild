import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  team_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'under-review';
  due_date: string;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
  assignees?: {
    id: string;
    name: string;
    avatar: string | null;
  }[];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch tasks with project and team information
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name),
          team:teams(id, name)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch task assignees
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          assignee:profiles(id, name, avatar)
        `);

      if (assigneesError) throw assigneesError;

      // Combine tasks with their assignees
      const tasksWithAssignees = (tasksData?.map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: task.status as 'pending' | 'in-progress' | 'completed' | 'overdue' | 'under-review',
        assignees: assigneesData
          ?.filter(a => a.task_id === task.id)
          .map(a => a.assignee)
          .filter((assignee): assignee is { id: string; name: string; avatar: string | null } => assignee !== null) || []
      })) || []) as Task[];

      setTasks(tasksWithAssignees);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erro ao carregar tarefas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    const assigneesChannel = supabase
      .channel('task-assignees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_assignees'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(assigneesChannel);
    };
  }, [fetchTasks]);

  const createTask = useCallback(async (taskData: {
    title: string;
    description: string;
    project_id: string | null;
    team_id?: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'under-review';
    due_date: Date;
    assignee_ids: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Insert task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          project_id: taskData.project_id,
          team_id: taskData.team_id || null,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.due_date.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Insert task assignees
      if (taskData.assignee_ids.length > 0) {
        const taskAssignees = taskData.assignee_ids.map(user_id => ({
          task_id: task.id,
          user_id: user_id,
        }));

        const { error: assigneesError } = await supabase
          .from('task_assignees')
          .insert(taskAssignees);

        if (assigneesError) throw assigneesError;
      }

      toast({
        title: 'Sucesso!',
        description: `Tarefa "${task.title}" criada com sucesso!`,
      });

      await fetchTasks();
      return task;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, fetchTasks]);

  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'project' | 'assignees'>>,
    assignee_ids?: string[]
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Update assignees if provided
      if (assignee_ids !== undefined) {
        // Delete existing assignees
        const { error: deleteError } = await supabase
          .from('task_assignees')
          .delete()
          .eq('task_id', taskId);

        if (deleteError) throw deleteError;

        // Insert new assignees
        if (assignee_ids.length > 0) {
          const taskAssignees = assignee_ids.map(user_id => ({
            task_id: taskId,
            user_id: user_id,
          }));

          const { error: insertError } = await supabase
            .from('task_assignees')
            .insert(taskAssignees);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Sucesso!',
        description: 'Tarefa atualizada com sucesso!',
      });

      await fetchTasks();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erro ao atualizar tarefa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Tarefa excluída com sucesso!',
      });

      await fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro ao excluir tarefa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, fetchTasks]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}
