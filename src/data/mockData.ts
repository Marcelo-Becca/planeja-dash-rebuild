// Mock data for the Planeja+ system

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

// Current user (for profile)
export const currentUser = mockUsers[0];