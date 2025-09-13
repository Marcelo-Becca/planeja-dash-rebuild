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

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Marina Santos',
    email: 'marina@example.com',
    avatar: 'MS',
    role: 'Product Manager'
  },
  {
    id: '2',
    name: 'Carlos Silva',
    email: 'carlos@example.com',
    avatar: 'CS',
    role: 'Developer'
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@example.com',
    avatar: 'AC',
    role: 'Designer'
  },
  {
    id: '4',
    name: 'Pedro Lima',
    email: 'pedro@example.com',
    avatar: 'PL',
    role: 'QA Analyst'
  }
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Sistema de Gestão',
    description: 'Desenvolvimento de um sistema completo de gestão para pequenas empresas',
    status: 'active',
    deadline: new Date('2024-12-15'),
    createdBy: mockUsers[0],
    team: [mockUsers[0], mockUsers[1], mockUsers[2]],
    progress: 65,
    tasksCount: 12,
    completedTasks: 8
  },
  {
    id: '2',
    name: 'App Mobile',
    description: 'Aplicativo mobile para acompanhamento de tarefas e projetos',
    status: 'active',
    deadline: new Date('2024-11-30'),
    createdBy: mockUsers[1],
    team: [mockUsers[1], mockUsers[2]],
    progress: 40,
    tasksCount: 8,
    completedTasks: 3
  },
  {
    id: '3',
    name: 'Website Institucional',
    description: 'Novo website com identidade visual moderna e responsiva',
    status: 'completed',
    deadline: new Date('2024-10-01'),
    createdBy: mockUsers[2],
    team: [mockUsers[2], mockUsers[3]],
    progress: 100,
    tasksCount: 6,
    completedTasks: 6
  }
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implementar autenticação',
    description: 'Desenvolver sistema de login e registro de usuários com validação de email',
    status: 'in-progress',
    priority: 'high',
    deadline: new Date('2024-10-20'),
    createdAt: new Date('2024-10-01'),
    createdBy: mockUsers[0],
    assignedTo: [mockUsers[1]],
    projectId: '1',
    comments: ['Já iniciei a implementação do JWT', 'Preciso revisar as validações']
  },
  {
    id: '2',
    title: 'Design da tela de dashboard',
    description: 'Criar mockups e protótipos para a tela principal do sistema',
    status: 'completed',
    priority: 'medium',
    deadline: new Date('2024-10-15'),
    createdAt: new Date('2024-09-20'),
    createdBy: mockUsers[0],
    assignedTo: [mockUsers[2]],
    projectId: '1',
    comments: ['Protótipo aprovado pela equipe']
  },
  {
    id: '3',
    title: 'Testes automatizados',
    description: 'Implementar suite de testes para as funcionalidades principais',
    status: 'pending',
    priority: 'medium',
    deadline: new Date('2024-11-05'),
    createdAt: new Date('2024-10-10'),
    createdBy: mockUsers[1],
    assignedTo: [mockUsers[3]],
    projectId: '1',
    comments: []
  },
  {
    id: '4',
    title: 'Interface do app mobile',
    description: 'Desenvolver as telas principais do aplicativo mobile',
    status: 'in-progress',
    priority: 'high',
    deadline: new Date('2024-10-25'),
    createdAt: new Date('2024-10-05'),
    createdBy: mockUsers[1],
    assignedTo: [mockUsers[2]],
    projectId: '2',
    comments: ['Finalizando a tela de login']
  },
  {
    id: '5',
    title: 'Otimização SEO',
    description: 'Implementar meta tags e estrutura para melhor indexação',
    status: 'overdue',
    priority: 'low',
    deadline: new Date('2024-10-10'),
    createdAt: new Date('2024-09-15'),
    createdBy: mockUsers[2],
    assignedTo: [mockUsers[2]],
    projectId: '3',
    comments: ['Atrasado devido a outras prioridades']
  }
];

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

// Mock teams
export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Desenvolvimento Frontend',
    description: 'Equipe responsável pelo desenvolvimento da interface do usuário',
    objective: 'Criar interfaces modernas e responsivas para os projetos da empresa',
    status: 'active',
    color: 'blue',
    createdAt: new Date('2024-09-01'),
    createdBy: mockUsers[0],
    leader: mockUsers[1],
    members: [
      {
        id: '1',
        user: mockUsers[1],
        role: 'leader',
        joinedAt: new Date('2024-09-01'),
        tasksCount: 8
      },
      {
        id: '2',
        user: mockUsers[2],
        role: 'member',
        joinedAt: new Date('2024-09-15'),
        tasksCount: 5
      }
    ],
    projects: [mockProjects[0], mockProjects[1]],
    recentActivity: [
      {
        id: '1',
        type: 'member_added',
        description: 'Ana Costa foi adicionada à equipe',
        performedBy: mockUsers[1],
        timestamp: new Date('2024-10-10')
      },
      {
        id: '2',
        type: 'project_assigned',
        description: 'Projeto App Mobile foi associado à equipe',
        performedBy: mockUsers[0],
        timestamp: new Date('2024-10-08')
      }
    ]
  },
  {
    id: '2',
    name: 'Quality Assurance',
    description: 'Equipe dedicada aos testes e garantia de qualidade',
    objective: 'Assegurar a qualidade e confiabilidade de todos os produtos entregues',
    status: 'active',
    color: 'green',
    createdAt: new Date('2024-09-10'),
    createdBy: mockUsers[0],
    leader: mockUsers[3],
    members: [
      {
        id: '3',
        user: mockUsers[3],
        role: 'leader',
        joinedAt: new Date('2024-09-10'),
        tasksCount: 3
      }
    ],
    projects: [mockProjects[0]],
    recentActivity: [
      {
        id: '3',
        type: 'role_changed',
        description: 'Pedro Lima foi promovido a Líder',
        performedBy: mockUsers[0],
        timestamp: new Date('2024-10-05')
      }
    ]
  },
  {
    id: '3',
    name: 'Marketing Digital',
    description: 'Equipe de estratégias digitais e comunicação',
    objective: 'Desenvolver e executar estratégias de marketing digital',
    status: 'archived',
    color: 'purple',
    createdAt: new Date('2024-08-01'),
    createdBy: mockUsers[0],
    leader: mockUsers[0],
    members: [
      {
        id: '4',
        user: mockUsers[0],
        role: 'leader',
        joinedAt: new Date('2024-08-01'),
        tasksCount: 0
      }
    ],
    projects: [mockProjects[2]],
    recentActivity: [
      {
        id: '4',
        type: 'member_removed',
        description: 'Equipe foi arquivada',
        performedBy: mockUsers[0],
        timestamp: new Date('2024-10-01')
      }
    ]
  }
];

// Current user (for profile)
export const currentUser = mockUsers[0];