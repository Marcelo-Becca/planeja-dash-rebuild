import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalData } from './useLocalData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ReportFilters, 
  ChartDataPoint, 
  ProjectPerformanceData,
  TaskDistributionData,
  TeamProductivityData,
  DetailedTaskForReports
} from '@/types/reports';
import { subDays, subWeeks, subMonths, subQuarters, subYears, startOfDay, endOfDay, format, differenceInDays, isAfter, isBefore, isWithinInterval, isValid } from 'date-fns';

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
  const localData = useLocalData();
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  // Clean up any demo data from localStorage on component mount
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('planeja-demo-reports-data');
    }
  }, []);

  // Check if we have real data
  const hasRealData = useMemo(() => {
    return localData.projects.length > 0 || localData.tasks.length > 0 || localData.teams.length > 0;
  }, [localData.projects.length, localData.tasks.length, localData.teams.length]);

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

    return localData.tasks.filter(task => {
      // Date filter
      const taskDate = safeCreateDate(task.createdAt);
      if (!taskDate || !isWithinInterval(taskDate, dateRange)) return false;

      // Project filter
      if (filters.projects.length > 0 && !filters.projects.includes(task.projectId)) return false;

      // Status filter
      if (filters.status !== "all" && task.status !== filters.status) return false;

      // Member filter
      if (filters.members.length > 0) {
        const taskAssignees = task.assignedTo?.map(u => u.id) || [];
        if (!taskAssignees.some(id => filters.members.includes(id))) return false;
      }

      return true;
    }).map(task => {
      const createdDate = safeCreateDate(task.createdAt);
      const deadlineDate = safeCreateDate(task.deadline);
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        project: localData.projects.find(p => p.id === task.projectId)?.name || 'Projeto não encontrado',
        projectId: task.projectId,
        team: localData.teams.find(t => t.projects.some(p => p.id === task.projectId))?.name,
        assignee: task.assignedTo?.[0]?.name || 'Não atribuído',
        priority: task.priority,
        status: task.status,
        createdAt: safeFormatDate(createdDate),
        deadline: safeFormatDate(deadlineDate),
        completedAt: task.status === 'completed' ? safeFormatDate(deadlineDate) : undefined,
        timeSpent: task.status === 'completed' && createdDate && deadlineDate ? differenceInDays(deadlineDate, createdDate) : undefined
      } as DetailedTaskForReports;
    });
  }, [hasRealData, localData, dateRange, filters]);


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

    return localData.projects.map(project => {
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
  }, [hasRealData, localData.projects, filteredTasks]);

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

    return localData.teams.map(team => {
      const teamTasks = filteredTasks.filter(t => {
        const project = localData.projects.find(p => p.id === t.projectId);
        return team.projects.some(tp => tp.id === project?.id);
      });

      return {
        teamId: team.id,
        name: team.name,
        members: team.members.map(m => m.user.name),
        completedTasks: teamTasks.filter(t => t.status === 'completed').length,
        inProgressTasks: teamTasks.filter(t => t.status === 'in-progress').length,
        overdueTasks: teamTasks.filter(t => t.status === 'overdue').length,
        avgTasksPerMember: team.members.length > 0 ? teamTasks.length / team.members.length : 0
      };
    });
  }, [hasRealData, localData.teams, localData.projects, filteredTasks]);

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
      projects: localData.projects.map(p => ({ id: p.id, name: p.name })),
      teams: localData.teams.map(t => ({ id: t.id, name: t.name })),
      members: localData.users.map(u => ({ id: u.id, name: u.name }))
    };
  }, [hasRealData, localData]);

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