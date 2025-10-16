// Sample projects, tasks and teams using sample users (no test user dependency)
import { Project, Task, Team, TeamMember, TeamActivity, User } from './mockData';

// Define mockUsers locally to avoid any dependency on removed test users
export const mockUsers: User[] = [
  { id: 'u-001', name: 'Ana Silva', email: 'ana.silva@planejaplus.com', avatar: 'AS', role: 'Product Manager' },
  { id: 'u-002', name: 'Carlos Santos', email: 'carlos.santos@planejaplus.com', avatar: 'CS', role: 'Tech Lead' },
  { id: 'u-003', name: 'Marina Costa', email: 'marina.costa@planejaplus.com', avatar: 'MC', role: 'UX Designer' },
  { id: 'u-004', name: 'Roberto Lima', email: 'roberto.lima@planejaplus.com', avatar: 'RL', role: 'Backend Engineer' },
  { id: 'u-005', name: 'Julia Ferreira', email: 'julia.ferreira@planejaplus.com', avatar: 'JF', role: 'QA Analyst' },
  { id: 'u-006', name: 'Pedro Oliveira', email: 'pedro.oliveira@planejaplus.com', avatar: 'PO', role: 'Data Analyst' },
  { id: 'u-007', name: 'Camila Torres', email: 'camila.torres@planejaplus.com', avatar: 'CT', role: 'Mobile Developer' },
  { id: 'u-008', name: 'Lucas Mendes', email: 'lucas.mendes@planejaplus.com', avatar: 'LM', role: 'Frontend Developer' },
  { id: 'u-009', name: 'Fernanda Alves', email: 'fernanda.alves@planejaplus.com', avatar: 'FA', role: 'DevOps Engineer' },
  { id: 'u-010', name: 'Gabriel Rocha', email: 'gabriel.rocha@planejaplus.com', avatar: 'GR', role: 'Fullstack Developer' },
];


// Helper function to get user by index
const getUser = (index: number) => mockUsers[index % mockUsers.length];

// Helper function to get random users
const getRandomUsers = (count: number, exclude: string[] = []) => {
  const availableUsers = mockUsers.filter(user => !exclude.includes(user.id));
  const shuffled = [...availableUsers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, availableUsers.length));
};

// Sample Projects
export const sampleProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Plataforma de Gestão 2.0',
    description: 'Redesign completo da plataforma com nova arquitetura, melhor UX e performance otimizada.',
    status: 'active',
    deadline: new Date('2024-12-31'),
    createdBy: getUser(0), // Ana Silva
    team: [getUser(0), getUser(1), getUser(2), getUser(4), getUser(7)], // Ana, Carlos, Marina, Julia, Lucas
    progress: 65,
    tasksCount: 24,
    completedTasks: 16
  },
  {
    id: 'proj-002',
    name: 'Sistema de Relatórios Avançados',
    description: 'Desenvolvimento de dashboards interativos e relatórios customizados para análise de dados.',
    status: 'active',
    deadline: new Date('2024-11-15'),
    createdBy: getUser(5), // Pedro Oliveira
    team: [getUser(5), getUser(1), getUser(8), getUser(9)], // Pedro, Carlos, Fernanda, Gabriel
    progress: 40,
    tasksCount: 18,
    completedTasks: 7
  },
  {
    id: 'proj-003',
    name: 'App Mobile Planeja+',
    description: 'Aplicativo mobile nativo para iOS e Android com funcionalidades essenciais da plataforma.',
    status: 'active',
    deadline: new Date('2025-02-28'),
    createdBy: getUser(3), // Roberto Lima
    team: [getUser(3), getUser(9), getUser(2), getUser(4)], // Roberto, Gabriel, Marina, Julia
    progress: 25,
    tasksCount: 32,
    completedTasks: 8
  },
  {
    id: 'proj-004',
    name: 'Integração com APIs Externas',
    description: 'Integração com sistemas ERP, CRM e outras ferramentas corporativas utilizadas pelos clientes.',
    status: 'on-hold',
    deadline: new Date('2024-10-30'),
    createdBy: getUser(1), // Carlos Santos
    team: [getUser(1), getUser(8), getUser(3)], // Carlos, Fernanda, Roberto
    progress: 15,
    tasksCount: 12,
    completedTasks: 2
  },
  {
    id: 'proj-005',
    name: 'Design System Unificado',
    description: 'Criação de um design system completo para padronizar componentes e interfaces.',
    status: 'completed',
    deadline: new Date('2024-08-30'),
    createdBy: getUser(2), // Marina Costa
    team: [getUser(2), getUser(7), getUser(0)], // Marina, Lucas, Ana
    progress: 100,
    tasksCount: 15,
    completedTasks: 15
  }
];

// Sample Tasks
export const sampleTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Implementar autenticação OAuth 2.0',
    description: 'Desenvolver sistema de autenticação usando OAuth 2.0 com Google e Microsoft.',
    status: 'in-progress',
    priority: 'high',
    deadline: new Date('2024-10-15'),
    createdAt: new Date('2024-09-01'),
    createdBy: getUser(3), // Roberto Lima
    assignedTo: [getUser(1)], // Carlos Santos
    projectId: 'proj-001',
    comments: ['Aguardando aprovação das credenciais OAuth', 'Testes iniciais concluídos']
  },
  {
    id: 'task-002',
    title: 'Design da tela de onboarding',
    description: 'Criar wireframes e protótipos para o fluxo de primeiro acesso do usuário.',
    status: 'completed',
    priority: 'medium',
    deadline: new Date('2024-09-30'),
    createdAt: new Date('2024-09-10'),
    createdBy: getUser(0), // Ana Silva
    assignedTo: [getUser(2), getUser(7)], // Marina Costa, Lucas Mendes
    projectId: 'proj-001',
    comments: ['Protótipo aprovado pelo cliente', 'Implementação iniciada']
  },
  {
    id: 'task-003',
    title: 'Configurar pipeline CI/CD',
    description: 'Automatizar deploy e testes da aplicação usando GitLab CI.',
    status: 'pending',
    priority: 'high',
    deadline: new Date('2024-10-20'),
    createdAt: new Date('2024-09-15'),
    createdBy: getUser(8), // Fernanda Alves
    assignedTo: [getUser(8)], // Fernanda Alves
    projectId: 'proj-002',
    comments: []
  },
  {
    id: 'task-004',
    title: 'Criar dashboards de produtividade',
    description: 'Desenvolver gráficos e métricas para acompanhar produtividade das equipes.',
    status: 'in-progress',
    priority: 'medium',
    deadline: new Date('2024-11-05'),
    createdAt: new Date('2024-09-20'),
    createdBy: getUser(5), // Pedro Oliveira
    assignedTo: [getUser(5), getUser(9)], // Pedro Oliveira, Gabriel Rocha
    projectId: 'proj-002',
    comments: ['Layout aprovado', 'Implementando gráficos interativos']
  },
  {
    id: 'task-005',
    title: 'Testes de usabilidade mobile',
    description: 'Executar testes com usuários reais para validar a experiência mobile.',
    status: 'pending',
    priority: 'low',
    deadline: new Date('2024-12-01'),
    createdAt: new Date('2024-09-25'),
    createdBy: getUser(2), // Marina Costa
    assignedTo: [getUser(4), getUser(7)], // Julia Ferreira, Lucas Mendes
    projectId: 'proj-003',
    comments: []
  },
  {
    id: 'task-006',
    title: 'Documentação da API REST',
    description: 'Criar documentação completa dos endpoints usando Swagger/OpenAPI.',
    status: 'overdue',
    priority: 'medium',
    deadline: new Date('2024-09-20'),
    createdAt: new Date('2024-08-15'),
    createdBy: getUser(1), // Carlos Santos
    assignedTo: [getUser(1)], // Carlos Santos
    projectId: 'proj-004',
    comments: ['Pendente revisão técnica', 'Prazo estendido devido a mudanças nos requisitos']
  }
];

// Sample Teams
export const sampleTeams: Team[] = [
  {
    id: 'team-001',
    name: 'Desenvolvimento Frontend',
    description: 'Equipe responsável pelo desenvolvimento das interfaces e experiência do usuário.',
    objective: 'Criar interfaces modernas, acessíveis e performáticas para todos os produtos.',
    status: 'active',
    color: '#3b82f6',
    createdAt: new Date('2024-01-15'),
    createdBy: getUser(3), // Roberto Lima
    leader: getUser(2), // Marina Costa
    members: [
      {
        id: 'member-001',
        user: getUser(2), // Marina Costa
        role: 'leader',
        joinedAt: new Date('2024-01-15'),
        tasksCount: 12
      },
      {
        id: 'member-002',
        user: getUser(9), // Gabriel Rocha
        role: 'member',
        joinedAt: new Date('2024-02-28'),
        tasksCount: 8
      },
      {
        id: 'member-003',
        user: getUser(7), // Lucas Mendes
        role: 'member',
        joinedAt: new Date('2024-04-01'),
        tasksCount: 4
      }
    ],
    projects: [sampleProjects[0], sampleProjects[2]], // Plataforma 2.0, App Mobile
    recentActivity: [
      {
        id: 'activity-001',
        type: 'member_added',
        description: 'Lucas Mendes entrou na equipe como estagiário',
        performedBy: getUser(2), // Marina Costa
        timestamp: new Date('2024-04-01')
      },
      {
        id: 'activity-002',
        type: 'project_assigned',
        description: 'Equipe designada para o projeto App Mobile Planeja+',
        performedBy: getUser(3), // Roberto Lima
        timestamp: new Date('2024-03-15')
      }
    ]
  },
  {
    id: 'team-002',
    name: 'Backend & DevOps',
    description: 'Equipe focada em arquitetura, APIs, banco de dados e infraestrutura.',
    objective: 'Garantir escalabilidade, segurança e performance da infraestrutura técnica.',
    status: 'active',
    color: '#10b981',
    createdAt: new Date('2023-11-08'),
    createdBy: getUser(3), // Roberto Lima
    leader: getUser(3), // Roberto Lima
    members: [
      {
        id: 'member-004',
        user: getUser(3), // Roberto Lima
        role: 'leader',
        joinedAt: new Date('2023-11-08'),
        tasksCount: 15
      },
      {
        id: 'member-005',
        user: getUser(1), // Carlos Santos
        role: 'manager',
        joinedAt: new Date('2024-02-03'),
        tasksCount: 18
      },
      {
        id: 'member-006',
        user: getUser(8), // Fernanda Alves
        role: 'member',
        joinedAt: new Date('2023-10-18'),
        tasksCount: 10
      }
    ],
    projects: [sampleProjects[0], sampleProjects[1], sampleProjects[3]], // Plataforma 2.0, Relatórios, Integrações
    recentActivity: [
      {
        id: 'activity-003',
        type: 'role_changed',
        description: 'Carlos Santos promovido para Manager',
        performedBy: getUser(3), // Roberto Lima
        timestamp: new Date('2024-04-10')
      }
    ]
  },
  {
    id: 'team-003',
    name: 'Produto & Dados',
    description: 'Equipe responsável por estratégia de produto, análise de dados e métricas.',
    objective: 'Orientar decisões baseadas em dados e definir roadmap de produtos.',
    status: 'active',
    color: '#f59e0b',
    createdAt: new Date('2024-01-20'),
    createdBy: getUser(0), // Ana Silva
    leader: getUser(0), // Ana Silva
    members: [
      {
        id: 'member-007',
        user: getUser(0), // Ana Silva
        role: 'leader',
        joinedAt: new Date('2024-01-15'),
        tasksCount: 14
      },
      {
        id: 'member-008',
        user: getUser(5), // Pedro Oliveira
        role: 'member',
        joinedAt: new Date('2024-01-29'),
        tasksCount: 11
      },
      {
        id: 'member-009',
        user: getUser(6), // Camila Torres
        role: 'member',
        joinedAt: new Date('2023-12-05'),
        tasksCount: 9
      }
    ],
    projects: [sampleProjects[1], sampleProjects[4]], // Relatórios, Design System
    recentActivity: [
      {
        id: 'activity-004',
        type: 'project_assigned',
        description: 'Equipe designada para Sistema de Relatórios Avançados',
        performedBy: getUser(0), // Ana Silva
        timestamp: new Date('2024-03-01')
      }
    ]
  },
  {
    id: 'team-004',
    name: 'Qualidade & Testes',
    description: 'Equipe dedicada à garantia de qualidade, testes e processos de QA.',
    objective: 'Assegurar alta qualidade e confiabilidade de todos os produtos entregues.',
    status: 'active',
    color: '#8b5cf6',
    createdAt: new Date('2024-03-12'),
    createdBy: getUser(6), // Camila Torres
    leader: getUser(4), // Julia Ferreira
    members: [
      {
        id: 'member-010',
        user: getUser(4), // Julia Ferreira
        role: 'leader',
        joinedAt: new Date('2024-03-12'),
        tasksCount: 13
      }
    ],
    projects: [sampleProjects[0], sampleProjects[2]], // Plataforma 2.0, App Mobile
    recentActivity: [
      {
        id: 'activity-005',
        type: 'member_added',
        description: 'Julia Ferreira criou a equipe de Qualidade & Testes',
        performedBy: getUser(6), // Camila Torres
        timestamp: new Date('2024-03-12')
      }
    ]
  }
];