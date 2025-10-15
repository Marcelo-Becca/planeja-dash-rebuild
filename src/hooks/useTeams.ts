import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Team {
  id: string;
  name: string;
  description: string;
  main_objective: string;
  leader_id: string;
  created_at: string;
  updated_at: string;
  members?: string[];
  leader?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function useTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams with members
  const fetchTeams = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!leader_id(id, name, avatar)
        `)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch team members for all teams
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, user_id');

      if (membersError) throw membersError;

      // Combine teams with their members
      const teamsWithMembers = (teamsData || []).map(team => ({
        ...team,
        members: membersData
          ?.filter(m => m.team_id === team.id)
          .map(m => m.user_id) || []
      }));

      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      toast.error('Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Setup realtime subscriptions
  useEffect(() => {
    fetchTeams();

    const teamsChannel = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams'
        },
        () => fetchTeams()
      )
      .subscribe();

    const membersChannel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => fetchTeams()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [fetchTeams]);

  // Create team
  const createTeam = useCallback(async (teamData: {
    name: string;
    description: string;
    main_objective: string;
    members: string[];
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          main_objective: teamData.main_objective,
          leader_id: user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add members
      if (teamData.members.length > 0) {
        const memberInserts = teamData.members.map(userId => ({
          team_id: team.id,
          user_id: userId
        }));

        const { error: membersError } = await supabase
          .from('team_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      toast.success('Equipe criada com sucesso!');
      return team;
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      toast.error('Erro ao criar equipe');
      return null;
    }
  }, [user]);

  // Update team
  const updateTeam = useCallback(async (
    teamId: string,
    updates: Partial<{
      name: string;
      description: string;
      main_objective: string;
      members: string[];
    }>
  ) => {
    try {
      // Update team basic info
      const { members, ...teamUpdates } = updates;
      
      if (Object.keys(teamUpdates).length > 0) {
        const { error: teamError } = await supabase
          .from('teams')
          .update(teamUpdates)
          .eq('id', teamId);

        if (teamError) throw teamError;
      }

      // Update members if provided
      if (members !== undefined) {
        // Remove all current members
        const { error: deleteError } = await supabase
          .from('team_members')
          .delete()
          .eq('team_id', teamId);

        if (deleteError) throw deleteError;

        // Add new members
        if (members.length > 0) {
          const memberInserts = members.map(userId => ({
            team_id: teamId,
            user_id: userId
          }));

          const { error: insertError } = await supabase
            .from('team_members')
            .insert(memberInserts);

          if (insertError) throw insertError;
        }
      }

      toast.success('Equipe atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      toast.error('Erro ao atualizar equipe');
    }
  }, []);

  // Delete team
  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast.success('Equipe excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      toast.error('Erro ao excluir equipe');
    }
  }, []);

  return {
    teams,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    refreshTeams: fetchTeams
  };
}
