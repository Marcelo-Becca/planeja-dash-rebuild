import { useState, useMemo, useCallback } from 'react';
import { useLocalData } from './useLocalData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ReportFilters, 
  KPIMetrics, 
  ChartDataPoint, 
  ProjectPerformanceData,
  TaskDistributionData,
  TeamProductivityData,
  DetailedTaskForReports,
  DemoDataSeed
} from '@/types/reports';
import { subDays, subWeeks, subMonths, subQuarters, subYears, startOfDay, endOfDay, format, differenceInDays, isAfter, isBefore, isWithinInterval } from 'date-fns';

// Demo data seeder
const createDemoDataSeed = (): DemoDataSeed => {
  const today = new Date();
  const demoUsers = [
    { id: 'demo-user-1', name: 'Ana Silva', team: 'Produto', role: 'Product Manager' },
    { id: 'demo-user-2', name: 'Carlos Santos', team: 'Desenvolvimento', role: 'Developer' },
    { id: 'demo-user-3', name: 'Marina Costa', team: 'Design', role: 'UX Designer' },
    { id: 'demo-user-4', name: 'Roberto Lima', team: 'Desenvolvimento', role: 'Tech Lead' },
    { id: 'demo-user-5', name: 'Julia Ferreira', team: 'QA', role: 'QA Analyst' },
    { id: 'demo-user-6', name: 'Pedro Oliveira', team: 'Produto', role: 'Data Analyst' },
  ];

  const demoTeams = [
    { id: 'demo-team-1', name: 'Produto', memberIds: ['demo-user-1', 'demo-user-6'] },
    { id: 'demo-team-2', name: 'Desenvolvimento', memberIds: ['demo-user-2', 'demo-user-4'] },
    { id: 'demo-team-3', name: 'Design', memberIds: ['demo-user-3'] },
    { id: 'demo-team-4', name: 'QA', memberIds: ['demo-user-5'] },
  ];

  const demoProjects = [
    {
      id: 'demo-proj-1',
      name: 'Lançamento Produto A',
      team: 'Produto',
      tasksCount: 28,
      completedTasks: 24,
      startDate: subDays(today, 45),
      endDate: subDays(today, 5)
    },
    {
      id: 'demo-proj-2',
      name: 'Reforma Portal',
      team: 'Desenvolvimento',
      tasksCount: 35,
      completedTasks: 18,
      startDate: subDays(today, 60),
      endDate: subDays(today, 10)
    },
    {
      id: 'demo-proj-3',
      name: 'App Mobile V2',
      team: 'Desenvolvimento',
      tasksCount: 42,
      completedTasks: 15,
      startDate: subDays(today, 30),
      endDate: subDays(today, -15)
    },
    {
      id: 'demo-proj-4',
      name: 'Design System',
      team: 'Design',
      tasksCount: 18,
      completedTasks: 18,
      startDate: subDays(today, 80),
      endDate: subDays(today, 20)
    },
    {
      id: 'demo-proj-5',
      name: 'Plataforma Analytics',
      team: 'Produto',
      tasksCount: 25,
      completedTasks: 8,
      startDate: subDays(today, 25),
      endDate: subDays(today, -10)
    },
    {
      id: 'demo-proj-6',
      name: 'Sistema de Pagamentos',
      team: 'Desenvolvimento',
      tasksCount: 32,
      completedTasks: 12,
      startDate: subDays(today, 40),
      endDate: subDays(today, -5)
    }
  ];

  // Generate demo tasks
  const demoTasks: DemoDataSeed['tasks'] = [];
  const statusOptions: Array<"pending" | "in-progress" | "completed" | "overdue"> = ["pending", "in-progress", "completed", "overdue"];
  const priorityOptions: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  
  demoProjects.forEach(project => {
    const taskNames = [
      'Criar wireframe inicial', 'Desenvolver API REST', 'Implementar autenticação', 
      'Design de interface', 'Testes unitários', 'Configurar CI/CD',
      'Documentação técnica', 'Revisar código', 'Deploy em produção',
      'Análise de requisitos', 'Protótipo funcional', 'Integração com sistema'
    ];

    for (let i = 0; i < project.tasksCount; i++) {
      const isCompleted = i < project.completedTasks;
      const createdDate = new Date(project.startDate.getTime() + (Math.random() * (project.endDate.getTime() - project.startDate.getTime())));
      const deadlineDate = new Date(createdDate.getTime() + (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000); // 1-14 days after creation
      
      let status: "pending" | "in-progress" | "completed" | "overdue";
      if (isCompleted) {
        status = "completed";
      } else if (deadlineDate < today) {
        status = "overdue";
      } else {
        status = Math.random() > 0.5 ? "in-progress" : "pending";
      }

      demoTasks.push({
        id: `demo-task-${project.id}-${i}`,
        title: `${taskNames[i % taskNames.length]} - ${project.name}`,
        description: `Tarefa relacionada ao projeto ${project.name}`,
        projectId: project.id,
        assigneeId: demoUsers[Math.floor(Math.random() * demoUsers.length)].id,
        status,
        priority: priorityOptions[Math.floor(Math.random() * priorityOptions.length)],
        createdAt: createdDate,
        deadline: deadlineDate,
        completedAt: isCompleted ? new Date(createdDate.getTime() + Math.random() * (deadlineDate.getTime() - createdDate.getTime())) : undefined
      });
    }
  });

  return { projects: demoProjects, tasks: demoTasks, users: demoUsers, teams: demoTeams };
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

  // Check if we have real data or need to use demo data
  const hasRealData = useMemo(() => {
    return localData.projects.length > 0 || localData.tasks.length > 0 || localData.teams.length > 0;
  }, [localData.projects.length, localData.tasks.length, localData.teams.length]);

  // Get or create demo data seed
  const demoData = useMemo(() => {
    if (hasRealData) return null;
    
    // Check if demo data already exists in localStorage
    const savedDemoData = localStorage.getItem('planeja-demo-reports-data');
    if (savedDemoData) {
      try {
        const parsed = JSON.parse(savedDemoData);
        // Convert date strings back to Date objects
        parsed.projects = parsed.projects.map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate)
        }));
        parsed.tasks = parsed.tasks.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          deadline: new Date(t.deadline),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined
        }));
        return parsed;
      } catch (error) {
        console.warn('Failed to parse demo data from localStorage:', error);
      }
    }
    
    // Create new demo data
    const newDemoData = createDemoDataSeed();
    localStorage.setItem('planeja-demo-reports-data', JSON.stringify(newDemoData));
    return newDemoData;
  }, [hasRealData]);

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

  // Get filtered tasks (real or demo data)
  const filteredTasks = useMemo(() => {
    if (hasRealData) {
      // Use real data
      return localData.tasks.filter(task => {
        // Date filter
        const taskDate = new Date(task.createdAt);
        if (!isWithinInterval(taskDate, dateRange)) return false;

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
      }).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        project: localData.projects.find(p => p.id === task.projectId)?.name || 'Projeto não encontrado',
        projectId: task.projectId,
        team: localData.teams.find(t => t.projects.some(p => p.id === task.projectId))?.name,
        assignee: task.assignedTo?.[0]?.name || 'Não atribuído',
        priority: task.priority,
        status: task.status,
        createdAt: format(new Date(task.createdAt), 'dd/MM/yyyy'),
        deadline: format(new Date(task.deadline), 'dd/MM/yyyy'),
        completedAt: task.status === 'completed' ? format(new Date(task.deadline), 'dd/MM/yyyy') : undefined,
        timeSpent: task.status === 'completed' ? differenceInDays(new Date(task.deadline), new Date(task.createdAt)) : undefined
      } as DetailedTaskForReports));
    } else if (demoData) {
      // Use demo data
      return demoData.tasks.filter(task => {
        // Date filter
        const taskDate = new Date(task.createdAt);
        if (!isWithinInterval(taskDate, dateRange)) return false;

        // Project filter
        if (filters.projects.length > 0 && !filters.projects.includes(task.projectId)) return false;

        // Status filter
        if (filters.status !== "all" && task.status !== filters.status) return false;

        // Member filter
        if (filters.members.length > 0 && !filters.members.includes(task.assigneeId)) return false;

        return true;
      }).map(task => {
        const project = demoData.projects.find(p => p.id === task.projectId);
        const assignee = demoData.users.find(u => u.id === task.assigneeId);
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          project: project?.name || 'Projeto não encontrado',
          projectId: task.projectId,
          team: project?.team,
          assignee: assignee?.name || 'Não atribuído',
          priority: task.priority,
          status: task.status,
          createdAt: format(new Date(task.createdAt), 'dd/MM/yyyy'),
          deadline: format(new Date(task.deadline), 'dd/MM/yyyy'),
          completedAt: task.completedAt ? format(new Date(task.completedAt), 'dd/MM/yyyy') : undefined,
          timeSpent: task.completedAt ? differenceInDays(new Date(task.completedAt), new Date(task.createdAt)) : undefined
        } as DetailedTaskForReports;
      });
    }
    return [];
  }, [hasRealData, localData, demoData, dateRange, filters]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo((): KPIMetrics => {
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const pending = filteredTasks.filter(t => t.status === 'pending').length;
    
    // Calculate average resolution time for completed tasks
    const completedWithTime = filteredTasks.filter(t => t.status === 'completed' && t.timeSpent);
    const avgResolution = completedWithTime.length > 0 
      ? completedWithTime.reduce((sum, t) => sum + (t.timeSpent || 0), 0) / completedWithTime.length 
      : 0;

    // Calculate unique members working
    const uniqueMembers = new Set(filteredTasks.map(t => t.assignee)).size;
    const avgLoadPerMember = uniqueMembers > 0 ? filteredTasks.length / uniqueMembers : 0;

    return {
      completedTasks: completed,
      pendingTasks: pending,
      goalsAchieved: "not-defined", // Would be calculated based on project goals
      averageResolutionTime: Math.round(avgResolution * 10) / 10,
      weeklyBurndown: completed > 0 ? Math.round((completed / filteredTasks.length) * 100) : 0,
      avgLoadPerMember: Math.round(avgLoadPerMember * 10) / 10,
      completedTasksTrend: 0, // TODO: Calculate vs previous period
      pendingTasksTrend: 0,
      resolutionTimeTrend: 0
    };
  }, [filteredTasks]);

  // Generate timeline chart data
  const timelineData = useMemo((): ChartDataPoint[] => {
    const dataMap = new Map<string, number>();
    
    filteredTasks.forEach(task => {
      if (task.status === 'completed') {
        const date = task.completedAt || task.createdAt;
        const key = format(new Date(date), 'yyyy-MM-dd');
        dataMap.set(key, (dataMap.get(key) || 0) + 1);
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
    if (hasRealData) {
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
    } else if (demoData) {
      return demoData.projects.map(project => {
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
    }
    return [];
  }, [hasRealData, localData.projects, demoData, filteredTasks]);

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
    if (hasRealData) {
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
    } else if (demoData) {
      return demoData.teams.map(team => {
        const teamTasks = filteredTasks.filter(t => {
          const project = demoData.projects.find(p => p.id === t.projectId);
          return project?.team === team.name;
        });

        return {
          teamId: team.id,
          name: team.name,
          members: team.memberIds.map(id => demoData.users.find(u => u.id === id)?.name || 'Unknown'),
          completedTasks: teamTasks.filter(t => t.status === 'completed').length,
          inProgressTasks: teamTasks.filter(t => t.status === 'in-progress').length,
          overdueTasks: teamTasks.filter(t => t.status === 'overdue').length,
          avgTasksPerMember: team.memberIds.length > 0 ? teamTasks.length / team.memberIds.length : 0
        };
      });
    }
    return [];
  }, [hasRealData, localData.teams, localData.projects, demoData, filteredTasks]);

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
    if (hasRealData) {
      return {
        projects: localData.projects.map(p => ({ id: p.id, name: p.name })),
        teams: localData.teams.map(t => ({ id: t.id, name: t.name })),
        members: localData.users.map(u => ({ id: u.id, name: u.name }))
      };
    } else if (demoData) {
      return {
        projects: demoData.projects.map(p => ({ id: p.id, name: p.name })),
        teams: demoData.teams.map(t => ({ id: t.id, name: t.name })),
        members: demoData.users.map(u => ({ id: u.id, name: u.name }))
      };
    }
    return { projects: [], teams: [], members: [] };
  }, [hasRealData, localData, demoData]);

  return {
    // State
    filters,
    loading,
    hasRealData,
    usingDemoData: !hasRealData,

    // Data
    filteredTasks,
    kpiMetrics,
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