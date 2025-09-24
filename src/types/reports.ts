// Types for comprehensive reports system

export interface ReportFilters {
  period: "day" | "week" | "month" | "quarter" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  projects: string[];
  teams: string[];
  members: string[];
  status: "all" | "pending" | "in-progress" | "completed" | "overdue";
  granularity: "day" | "week" | "month";
}

export interface KPIMetrics {
  completedTasks: number;
  pendingTasks: number;
  goalsAchieved: number | "not-defined";
  averageResolutionTime: number; // in days
  weeklyBurndown: number; // percentage
  avgLoadPerMember: number;
  // Trend indicators
  completedTasksTrend: number; // percentage change vs previous period
  pendingTasksTrend: number;
  resolutionTimeTrend: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ProjectPerformanceData {
  projectId: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  avgTimePerTask: number; // in days
}

export interface TaskDistributionData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TeamProductivityData {
  teamId: string;
  name: string;
  members: string[];
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  avgTasksPerMember: number;
}

export interface DetailedTaskForReports {
  id: string;
  title: string;
  description: string;
  project: string;
  projectId: string;
  team?: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue";
  createdAt: string;
  deadline: string;
  completedAt?: string;
  timeSpent?: number; // in days
}

export interface ReportSchedule {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  format: "csv" | "pdf";
  filters: ReportFilters;
  recipients: string[];
  createdAt: Date;
  lastRun?: Date;
  nextRun: Date;
}

export interface ExportOptions {
  format: "csv" | "pdf" | "png";
  includeCharts?: boolean;
  includeFilters?: boolean;
  dateRange?: string;
}

// Demo data seed structure
export interface DemoDataSeed {
  projects: {
    id: string;
    name: string;
    team: string;
    tasksCount: number;
    completedTasks: number;
    startDate: Date;
    endDate: Date;
  }[];
  tasks: {
    id: string;
    title: string;
    description: string;
    projectId: string;
    assigneeId: string;
    status: "pending" | "in-progress" | "completed" | "overdue";
    priority: "low" | "medium" | "high";
    createdAt: Date;
    deadline: Date;
    completedAt?: Date;
  }[];
  users: {
    id: string;
    name: string;
    team: string;
    role: string;
  }[];
  teams: {
    id: string;
    name: string;
    memberIds: string[];
  }[];
}