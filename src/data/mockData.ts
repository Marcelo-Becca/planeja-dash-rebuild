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
  teams?: Team[]; // Multiple teams support
  progress: number;
  tasksCount: number;
  completedTasks: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
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
  subtasks?: SubTask[];
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

// Import sample data and mockUsers
import { sampleProjects, sampleTasks, sampleTeams, mockUsers } from './sampleData';

// Re-export mockUsers for compatibility
export { mockUsers };

// Mock projects - using sample data
export const mockProjects: Project[] = sampleProjects;

// Mock tasks - using sample data
export const mockTasks: Task[] = sampleTasks;

// Mock teams - using sample data
export const mockTeams: Team[] = sampleTeams;

// Current user (for profile) - default to first mock user
export const currentUser: User = mockUsers[0] || {
  id: 'current',
  name: 'Ana Silva',
  email: 'ana.silva@planejaplus.com',
  avatar: 'AS',
  role: 'Product Manager'
};