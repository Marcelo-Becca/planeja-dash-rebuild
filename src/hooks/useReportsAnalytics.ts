import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ReportFilters, 
  ChartDataPoint, 
  ProjectPerformanceData,
  TaskDistributionData,
  TeamProductivityData,
  DetailedTaskForReports
} from '@/types/reports';
import { subDays, subWeeks, subMonths, subQuarters, subYears, startOfDay, endOfDay, format, differenceInDays, isAfter, isBefore, isWithinInterval, isValid, parseISO } from 'date-fns';

// Helper functions for data processing

// Helper function to safely format dates
const safeFormatDate = (date: any, formatString: string = 'dd/MM/yyyy'): string => {
  if (!date) return '—';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return '—';
  return format(dateObj, formatString);
};

// Helper function to safely create date objects
const safeCreateDate = (date: any): Date | null => {
  if (!date) return null;
  const dateObj = date instanceof Date ? date : new Date(date);
  return isValid(dateObj) ? dateObj : null;
};

// Default filters
const defaultFilters: ReportFilters = {
  period: "month",
  projects: [],
  teams: [],
  members: [],
  status: "all",
  granularity: "day"
};

export function useReportsAnalytics() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch tasks with assignees
        const { data: tasksData } = await supabase
          .from('tasks')
          .select(`
            *,
            task_assignees (
              user_id,
              profiles (
                id,
                name,
                display_name,
                avatar
              )
            )
          `)
          .order('created_at', { ascending: false });

        // Fetch teams with members
        const { data: teamsData } = await supabase
          .from('teams')
          .select(`
            *,
            team_members (
              user_id,
              profiles (
                id,
                name,
                display_name,
                avatar
              )
            ),
            project_teams (
              project_id
            )
          `)
          .order('created_at', { ascending: false });

        // Fetch profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .order('name');

        setProjects(projectsData || []);
        setTasks(tasksData || []);
        setTeams(teamsData || []);
        setProfiles(profilesData || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();

    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchData)
      .subscribe();

    const teamsChannel = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(teamsChannel);
    };
  }, []);

  // Check if we have real data
  const hasRealData = useMemo(() => {
    return projects.length > 0 || tasks.length > 0 || teams.length > 0;
  }, [projects.length, tasks.length, teams.length]);

  // Calculate date range based on filters
  const dateRange = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;

    if (filters.period === "custom" && filters.startDate && filters.endDate) {
      start = startOfDay(new Date(filters.startDate));
      end = endOfDay(new Date(filters.endDate));
    } else {
      end = endOfDay(today);
      switch (filters.period) {
        case "day":
          start = startOfDay(today);
          break;
        case "week":
          start = subWeeks(startOfDay(today), 1);
          break;
        case "month":
          start = subMonths(startOfDay(today), 1);
          break;
        case "quarter":
          start = subQuarters(startOfDay(today), 1);
          break;
        case "year":
          start = subYears(startOfDay(today), 1);
          break;
        default:
          start = subMonths(startOfDay(today), 1);
      }
    }

    return { start, end };
  }, [filters.period, filters.startDate, filters.endDate]);

  // Get filtered tasks (real data only)
  const filteredTasks = useMemo(() => {
    if (!hasRealData) return [];

    return tasks.filter(task => {
      // Date filter
      const taskDate = safeCreateDate(task.created_at);
      if (!taskDate || !isWithinInterval(taskDate, dateRange)) return false;

      // Project filter
      if (filters.projects.length > 0 && !filters.projects.includes(task.project_id)) return false;

      // Status filter
      if (filters.status !== "all" && task.status !== filters.status) return false;

      // Member filter
      if (filters.members.length > 0) {
        const taskAssignees = task.task_assignees?.map((ta: any) => ta.user_id) || [];
        if (!taskAssignees.some((id: string) => filters.members.includes(id))) return false;
      }

      return true;
    }).map(task => {
      const createdDate = safeCreateDate(task.created_at);
      const deadlineDate = safeCreateDate(task.due_date);
      const project = projects.find(p => p.id === task.project_id);
      const team = teams.find(t => t.project_teams?.some((pt: any) => pt.project_id === task.project_id));
      const assignee = task.task_assignees?.[0]?.profiles;
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        project: project?.name || 'Projeto não encontrado',
        projectId: task.project_id,
        team: team?.name,
        assignee: assignee?.name || assignee?.display_name || 'Não atribuído',
        priority: task.priority,
        status: task.status,
        createdAt: safeFormatDate(createdDate),
        deadline: safeFormatDate(deadlineDate),
        completedAt: task.status === 'completed' ? safeFormatDate(deadlineDate) : undefined,
        timeSpent: task.status === 'completed' && createdDate && deadlineDate ? differenceInDays(deadlineDate, createdDate) : undefined
      } as DetailedTaskForReports;
    });
  }, [hasRealData, tasks, projects, teams, dateRange, filters]);


  // Generate timeline chart data
  const timelineData = useMemo((): ChartDataPoint[] => {
    const dataMap = new Map<string, number>();
    
    filteredTasks.forEach(task => {
      if (task.status === 'completed') {
        const date = task.completedAt || task.createdAt;
        const dateObj = safeCreateDate(date);
        if (dateObj) {
          const key = format(dateObj, 'yyyy-MM-dd');
          dataMap.set(key, (dataMap.get(key) || 0) + 1);
        }
      }
    });

    // Fill in missing dates with 0
    const result: ChartDataPoint[] = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    while (current <= end) {
      const key = format(current, 'yyyy-MM-dd');
      result.push({
        date: format(current, 'dd/MM'),
        value: dataMap.get(key) || 0
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [filteredTasks, dateRange]);

  // Generate project performance data
  const projectPerformanceData = useMemo((): ProjectPerformanceData[] => {
    if (!hasRealData) return [];

    return projects.map(project => {
      const projectTasks = filteredTasks.filter(t => t.projectId === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'completed');
      
      return {
        projectId: project.id,
        name: project.name,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        completionRate: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0,
        overdueTasks: projectTasks.filter(t => t.status === 'overdue').length,
        avgTimePerTask: completedTasks.length > 0 
          ? completedTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0) / completedTasks.length 
          : 0
      };
    });
  }, [hasRealData, projects, filteredTasks]);

  // Generate task distribution data
  const taskDistributionData = useMemo((): TaskDistributionData[] => {
    const statusCounts = {
      pending: filteredTasks.filter(t => t.status === 'pending').length,
      'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length,
      overdue: filteredTasks.filter(t => t.status === 'overdue').length
    };

    const total = filteredTasks.length;
    const colors = {
      pending: 'hsl(var(--chart-3))',
      'in-progress': 'hsl(var(--chart-2))',
      completed: 'hsl(var(--chart-1))',
      overdue: 'hsl(var(--chart-4))'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[status as keyof typeof colors]
    }));
  }, [filteredTasks]);

  // Generate team productivity data
  const teamProductivityData = useMemo((): TeamProductivityData[] => {
    if (!hasRealData) return [];

    return teams.map(team => {
      const teamProjects = team.project_teams?.map((pt: any) => pt.project_id) || [];
      const teamTasks = filteredTasks.filter(t => teamProjects.includes(t.projectId));
      const members = team.team_members?.map((tm: any) => tm.profiles?.name || tm.profiles?.display_name) || [];

      return {
        teamId: team.id,
        name: team.name,
        members: members,
        completedTasks: teamTasks.filter(t => t.status === 'completed').length,
        inProgressTasks: teamTasks.filter(t => t.status === 'in-progress').length,
        overdueTasks: teamTasks.filter(t => t.status === 'overdue').length,
        avgTasksPerMember: members.length > 0 ? teamTasks.length / members.length : 0
      };
    });
  }, [hasRealData, teams, filteredTasks]);

  // Get tasks by category for drill-down
  const getTasksByCategory = useCallback((category: string) => {
    return filteredTasks.filter(task => {
      switch (category) {
        case 'completed':
        case 'completedTasks':
          return task.status === 'completed';
        case 'pending':
        case 'pendingTasks':
          return task.status === 'pending';
        case 'overdue':
          return task.status === 'overdue';
        case 'in-progress':
          return task.status === 'in-progress';
        default:
          return false;
      }
    });
  }, [filteredTasks]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Get available filter options
  const filterOptions = useMemo(() => {
    if (!hasRealData) return { projects: [], teams: [], members: [] };

    return {
      projects: projects.map(p => ({ id: p.id, name: p.name })),
      teams: teams.map(t => ({ id: t.id, name: t.name })),
      members: profiles.map(u => ({ id: u.id, name: u.name || u.display_name }))
    };
  }, [hasRealData, projects, teams, profiles]);

  return {
    // State
    filters,
    loading,
    hasRealData,

    // Data
    filteredTasks,
    timelineData,
    projectPerformanceData,
    taskDistributionData,
    teamProductivityData,
    filterOptions,

    // Actions
    updateFilters,
    resetFilters,
    getTasksByCategory,
  };
}