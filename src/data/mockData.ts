// Mock data for the Planeja+ system

export interface ReportData {
  productivity: {
    completedTasks: number;
    achievedGoals: number;
    activeProjects: number;
    overdueTasks: number;
  };
  projectPerformance: Array<{
    name: string;
    progress: number;
    completedTasks: number;
    pendingTasks: number;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  deadline: Date;
  createdBy: User;
  team: User[];
  progress: number;
  tasksCount: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  createdAt: Date;
  createdBy: User;
  assignedTo: User[];
  projectId: string;
  comments: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  objective: string;
  status: 'active' | 'archived';
  color: string;
  createdAt: Date;
  createdBy: User;
  leader: User;
  members: TeamMember[];
  projects: Project[];
  recentActivity: TeamActivity[];
}

export interface TeamMember {
  id: string;
  user: User;
  role: 'leader' | 'manager' | 'member';
  joinedAt: Date;
  tasksCount: number;
}

export interface TeamActivity {
  id: string;
  type: 'member_added' | 'member_removed' | 'role_changed' | 'project_assigned';
  description: string;
  performedBy: User;
  timestamp: Date;
}

// Mock users - cleared as requested (backup saved in backup_removed_data.json)
export const mockUsers: User[] = [];

// Mock projects - cleared as requested (backup saved in backup_removed_data.json)
export const mockProjects: Project[] = [];

// Mock tasks - cleared as requested (backup saved in backup_removed_data.json)
export const mockTasks: Task[] = [];

// Mock teams - cleared as requested (backup saved in backup_removed_data.json)
export const mockTeams: Team[] = [];

// Current user (for profile) - using empty default
export const currentUser: User = {
  id: 'current',
  name: 'Usuário',
  email: 'usuario@planeja.com',
  avatar: 'U',
  role: 'Usuário'
};