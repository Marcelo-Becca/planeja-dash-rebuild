import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string | null;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  tags: string[] | null;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
  leader?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  teams?: {
    id: string;
    name: string;
  }[];
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch projects with leader information
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          leader:profiles!projects_leader_id_fkey(id, name, avatar)
        `)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch project teams relationships
      const { data: projectTeamsData, error: projectTeamsError } = await supabase
        .from('project_teams')
        .select(`
          project_id,
          team:teams(id, name)
        `);

      if (projectTeamsError) throw projectTeamsError;

      // Combine projects with their teams
      const projectsWithTeams = (projectsData?.map(project => ({
        ...project,
        priority: project.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: project.status as 'active' | 'completed' | 'on-hold' | 'planning',
        teams: projectTeamsData
          ?.filter(pt => pt.project_id === project.id)
          .map(pt => pt.team)
          .filter((team): team is { id: string; name: string } => team !== null) || []
      })) || []) as Project[];

      setProjects(projectsWithTeams);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Erro ao carregar projetos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time changes
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    const projectTeamsChannel = supabase
      .channel('project-teams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_teams'
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(projectTeamsChannel);
    };
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData: {
    name: string;
    category: string;
    description: string;
    start_date: Date;
    end_date: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'active' | 'completed' | 'on-hold' | 'planning';
    tags?: string[];
    leader_id: string;
    team_ids: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          category: projectData.category,
          description: projectData.description,
          start_date: projectData.start_date.toISOString().split('T')[0],
          end_date: projectData.end_date.toISOString().split('T')[0],
          priority: projectData.priority,
          status: projectData.status,
          tags: projectData.tags || null,
          leader_id: projectData.leader_id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert project-team relationships
      if (projectData.team_ids.length > 0) {
        const projectTeams = projectData.team_ids.map(team_id => ({
          project_id: project.id,
          team_id: team_id,
        }));

        const { error: teamError } = await supabase
          .from('project_teams')
          .insert(projectTeams);

        if (teamError) throw teamError;
      }

      toast({
        title: 'Sucesso!',
        description: `Projeto "${project.name}" criado com sucesso!`,
      });

      await fetchProjects();
      return project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Erro ao criar projeto',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, fetchProjects]);

  const updateProject = useCallback(async (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'leader' | 'teams'>>,
    team_ids?: string[]
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (updateError) throw updateError;

      // Update teams if provided
      if (team_ids !== undefined) {
        // Delete existing team relationships
        const { error: deleteError } = await supabase
          .from('project_teams')
          .delete()
          .eq('project_id', projectId);

        if (deleteError) throw deleteError;

        // Insert new team relationships
        if (team_ids.length > 0) {
          const projectTeams = team_ids.map(team_id => ({
            project_id: projectId,
            team_id: team_id,
          }));

          const { error: insertError } = await supabase
            .from('project_teams')
            .insert(projectTeams);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Sucesso!',
        description: 'Projeto atualizado com sucesso!',
      });

      await fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Erro ao atualizar projeto',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, fetchProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      // Gather related task IDs for this project
      const { data: taskIdsData, error: tasksSelectError } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId);

      if (tasksSelectError) throw tasksSelectError;

      const taskIds = (taskIdsData ?? []).map((t: { id: string }) => t.id);

      // Delete task-related records first to avoid FK or RLS issues
      if (taskIds.length > 0) {
        const { error: delAssigneesError } = await supabase
          .from('task_assignees')
          .delete()
          .in('task_id', taskIds);
        if (delAssigneesError) throw delAssigneesError;

        const { error: delCommentsError } = await supabase
          .from('task_comments')
          .delete()
          .in('task_id', taskIds);
        if (delCommentsError) throw delCommentsError;

        const { error: delSubtasksError } = await supabase
          .from('task_subtasks')
          .delete()
          .in('task_id', taskIds);
        if (delSubtasksError) throw delSubtasksError;
      }

      // Delete tasks of this project
      const { error: delTasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);
      if (delTasksError) throw delTasksError;

      // Delete project-team relationships
      const { error: delProjectTeamsError } = await supabase
        .from('project_teams')
        .delete()
        .eq('project_id', projectId);
      if (delProjectTeamsError) throw delProjectTeamsError;

      // Finally, delete the project itself
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Projeto excluído com sucesso!',
      });

      await fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Erro ao excluir projeto',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, fetchProjects]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
}