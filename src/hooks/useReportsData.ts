import { useState, useEffect, useMemo } from "react";
import { mockProjects, mockTasks, mockUsers } from "@/data/mockData";

export interface ReportsFilters {
  period: "day" | "week" | "month" | "quarter" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  projects: string[];
  members: string[];
  granularity: "day" | "week" | "month";
}

export interface MetricsData {
  completedTasks: number;
  achievedGoals: number | "not-defined";
  activeProjects: number;
  overdueTasks: number;
}

export interface ChartData {
  projectPerformance: Array<{
    name: string;
    progress: number;
    completed: number;
    inProgress: number;
    overdue: number;
    total: number;
  }>;
  taskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  teamProductivity: Array<{
    name: string;
    completed: number;
    inProgress: number;
    overdue: number;
  }>;
  activityTimeline: Array<{
    date: string;
    tasks: number;
  }>;
}

export interface DetailedTask {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  createdAt: string;
  deadline: string;
  completedAt?: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
}

const defaultFilters: ReportsFilters = {
  period: "month",
  projects: [],
  members: [],
  granularity: "day"
};

export function useReportsData() {
  const [filters, setFilters] = useState<ReportsFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  // Simulate loading when filters change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [filters]);

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filters.period) {
      case "day":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "week":
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: today };
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: today };
      case "quarter":
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { start: quarterStart, end: today };
      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { start: yearStart, end: today };
      case "custom":
        return {
          start: filters.startDate ? new Date(filters.startDate) : today,
          end: filters.endDate ? new Date(filters.endDate) : today
        };
      default:
        return { start: today, end: today };
    }
  }, [filters.period, filters.startDate, filters.endDate]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      // Date filter
      const taskDate = new Date(task.createdAt);
      if (taskDate < dateRange.start || taskDate > dateRange.end) return false;
      
      // Project filter
      if (filters.projects.length > 0 && !filters.projects.includes(task.projectId)) return false;
      
      // Member filter
      if (filters.members.length > 0) {
        const hasAssignedMember = task.assignedTo.some(user => filters.members.includes(user.id));
        if (!hasAssignedMember) return false;
      }
      
      return true;
    });
  }, [dateRange, filters.projects, filters.members]);

  // Calculate metrics
  const metricsData: MetricsData = useMemo(() => {
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const overdue = filteredTasks.filter(t => t.status === 'overdue').length;
    const activeProjects = new Set(filteredTasks.map(t => t.projectId)).size;
    
    return {
      completedTasks: completed,
      achievedGoals: "not-defined", // TODO: Add goals logic
      activeProjects,
      overdueTasks: overdue
    };
  }, [filteredTasks]);

  // Generate chart data
  const chartData: ChartData = useMemo(() => {
    // Project performance
    const projectStats = new Map();
    filteredTasks.forEach(task => {
      const project = mockProjects.find(p => p.id === task.projectId);
      if (!project) return;
      
      if (!projectStats.has(project.name)) {
        projectStats.set(project.name, { completed: 0, inProgress: 0, overdue: 0, pending: 0 });
      }
      
      const stats = projectStats.get(project.name);
      if (task.status === 'completed') stats.completed++;
      else if (task.status === 'in-progress') stats.inProgress++;
      else if (task.status === 'overdue') stats.overdue++;
      else stats.pending++;
    });

    const projectPerformance = Array.from(projectStats.entries()).map(([name, stats]) => ({
      name,
      progress: Math.round((stats.completed / (stats.completed + stats.inProgress + stats.overdue + stats.pending)) * 100),
      completed: stats.completed,
      inProgress: stats.inProgress,
      overdue: stats.overdue,
      total: stats.completed + stats.inProgress + stats.overdue + stats.pending
    }));

    // Task distribution
    const taskCounts = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const taskDistribution = [
      { name: "Concluídas", value: taskCounts.completed || 0, color: "hsl(var(--chart-1))" },
      { name: "Em andamento", value: taskCounts['in-progress'] || 0, color: "hsl(var(--chart-2))" },
      { name: "Pendentes", value: taskCounts.pending || 0, color: "hsl(var(--chart-3))" },
      { name: "Atrasadas", value: taskCounts.overdue || 0, color: "hsl(var(--chart-4))" }
    ];

    // Team productivity
    const memberStats = new Map();
    filteredTasks.forEach(task => {
      task.assignedTo.forEach(member => {
        if (!memberStats.has(member.name)) {
          memberStats.set(member.name, { completed: 0, inProgress: 0, overdue: 0 });
        }
        
        const stats = memberStats.get(member.name);
        if (task.status === 'completed') stats.completed++;
        else if (task.status === 'in-progress') stats.inProgress++;
        else if (task.status === 'overdue') stats.overdue++;
      });
    });

    const teamProductivity = Array.from(memberStats.entries()).map(([name, stats]) => ({
      name,
      completed: stats.completed,
      inProgress: stats.inProgress,
      overdue: stats.overdue
    }));

    // Activity timeline
    const timelineData = new Map();
    filteredTasks.forEach(task => {
      const date = task.createdAt.toISOString().split('T')[0];
      timelineData.set(date, (timelineData.get(date) || 0) + 1);
    });

    const activityTimeline = Array.from(timelineData.entries())
      .map(([date, tasks]) => ({ date, tasks }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      projectPerformance,
      taskDistribution,
      teamProductivity,
      activityTimeline
    };
  }, [filteredTasks]);

  // Get detailed tasks by category
  const getDetailedTasks = (category: string): DetailedTask[] => {
    const categoryTasks = filteredTasks.filter(task => {
      switch (category) {
        case 'completed': return task.status === 'completed';
        case 'in-progress': return task.status === 'in-progress';
        case 'pending': return task.status === 'pending';
        case 'overdue': return task.status === 'overdue';
        default: return false;
      }
    });

    return categoryTasks.map(task => {
      const project = mockProjects.find(p => p.id === task.projectId);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        project: project?.name || 'Projeto não encontrado',
        assignee: task.assignedTo.map(u => u.name).join(', '),
        createdAt: task.createdAt.toLocaleDateString('pt-BR'),
        deadline: task.deadline.toLocaleDateString('pt-BR'),
        completedAt: task.status === 'completed' ? task.createdAt.toLocaleDateString('pt-BR') : undefined,
        status: task.status
      };
    });
  };

  const updateFilters = (newFilters: Partial<ReportsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    loading,
    metricsData,
    chartData,
    updateFilters,
    resetFilters,
    getDetailedTasks,
    hasData: filteredTasks.length > 0
  };
}