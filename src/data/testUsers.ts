// Test users for system validation and demonstration
export interface TestUser {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  role: string;
  company: string;
  avatar?: string;
  description: string;
  seniority: 'estagiario' | 'junior' | 'pleno' | 'senior' | 'lead';
  department: string;
  emailVerified: boolean;
  createdAt: Date;
}

// Test users - comprehensive set of fictional profiles for testing
export const testUsers: TestUser[] = [
  {
    id: 'test-user-01',
    name: 'Ana Silva',
    email: 'ana.silva@planejaplus.com',
    displayName: 'Ana',
    role: 'Product Manager',
    company: 'Planeja+',
    avatar: 'AS',
    description: 'Product Manager sênior com 8 anos de experiência em produtos digitais. Especialista em roadmaps, análise de métricas e gestão de stakeholders.',
    seniority: 'senior',
    department: 'Produto',
    emailVerified: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'test-user-02',
    name: 'Carlos Santos',
    email: 'carlos.santos@planejaplus.com',
    displayName: 'Carlos',
    role: 'Desenvolvedor Full Stack',
    company: 'Planeja+',
    avatar: 'CS',
    description: 'Desenvolvedor full stack pleno com sólida experiência em React, Node.js e bancos de dados. Apaixonado por arquitetura limpa e boas práticas.',
    seniority: 'pleno',
    department: 'Desenvolvimento',
    emailVerified: true,
    createdAt: new Date('2024-02-03')
  },
  {
    id: 'test-user-03',
    name: 'Marina Costa',
    email: 'marina.costa@planejaplus.com',
    displayName: 'Marina',
    role: 'UX/UI Designer',
    company: 'Planeja+',
    avatar: 'MC',
    description: 'Designer de produto com foco em experiência do usuário e interfaces intuitivas. Especialista em design systems e pesquisa com usuários.',
    seniority: 'pleno',
    department: 'Design',
    emailVerified: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'test-user-04',
    name: 'Roberto Lima',
    email: 'roberto.lima@planejaplus.com',
    displayName: 'Roberto',
    role: 'Tech Lead',
    company: 'Planeja+',
    avatar: 'RL',
    description: 'Tech Lead com 10+ anos de experiência liderando equipes de desenvolvimento. Expert em arquitetura de software e mentoria técnica.',
    seniority: 'lead',
    department: 'Tecnologia',
    emailVerified: true,
    createdAt: new Date('2023-11-08')
  },
  {
    id: 'test-user-05',
    name: 'Julia Ferreira',
    email: 'julia.ferreira@planejaplus.com',
    displayName: 'Julia',
    role: 'QA Analyst',
    company: 'Planeja+',
    avatar: 'JF',
    description: 'Analista de qualidade júnior com 2 anos de experiência em testes manuais e automatizados. Focada em garantir a melhor experiência do usuário.',
    seniority: 'junior',
    department: 'Qualidade',
    emailVerified: true,
    createdAt: new Date('2024-03-12')
  },
  {
    id: 'test-user-06',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@planejaplus.com',
    displayName: 'Pedro',
    role: 'Data Analyst',
    company: 'Planeja+',
    avatar: 'PO',
    description: 'Analista de dados pleno especializado em business intelligence, criação de dashboards e análise de métricas de produto e negócio.',
    seniority: 'pleno',
    department: 'Dados',
    emailVerified: true,
    createdAt: new Date('2024-01-29')
  },
  {
    id: 'test-user-07',
    name: 'Camila Torres',
    email: 'camila.torres@planejaplus.com',
    displayName: 'Camila',
    role: 'Scrum Master',
    company: 'Planeja+',
    avatar: 'CT',
    description: 'Scrum Master sênior com certificação PSM II. Especialista em agilidade, facilitação de cerimônias e melhoria contínua de processos.',
    seniority: 'senior',
    department: 'Agilidade',
    emailVerified: true,
    createdAt: new Date('2023-12-05')
  },
  {
    id: 'test-user-08',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@planejaplus.com',
    displayName: 'Lucas',
    role: 'Estagiário de Design',
    company: 'Planeja+',
    avatar: 'LM',
    description: 'Estudante de Design Digital cursando 6º semestre. Aprendendo sobre UX/UI design, prototipagem e pesquisa com usuários.',
    seniority: 'estagiario',
    department: 'Design',
    emailVerified: true,
    createdAt: new Date('2024-04-01')
  },
  {
    id: 'test-user-09',
    name: 'Fernanda Alves',
    email: 'fernanda.alves@planejaplus.com',
    displayName: 'Fernanda',
    role: 'DevOps Engineer',
    company: 'Planeja+',
    avatar: 'FA',
    description: 'Engenheira DevOps sênior especializada em cloud computing, CI/CD, containerização e monitoramento de infraestrutura.',
    seniority: 'senior',
    department: 'Infraestrutura',
    emailVerified: true,
    createdAt: new Date('2023-10-18')
  },
  {
    id: 'test-user-10',
    name: 'Gabriel Rocha',
    email: 'gabriel.rocha@planejaplus.com',
    displayName: 'Gabriel',
    role: 'Frontend Developer',
    company: 'Planeja+',
    avatar: 'GR',
    description: 'Desenvolvedor frontend júnior especializado em React e TypeScript. Focado em componentes reutilizáveis e performance de aplicações web.',
    seniority: 'junior',
    department: 'Desenvolvimento',
    emailVerified: true,
    createdAt: new Date('2024-02-28')
  }
];

// Function to get a random test user (useful for demonstrations)
export const getRandomTestUser = (): TestUser => {
  const randomIndex = Math.floor(Math.random() * testUsers.length);
  return testUsers[randomIndex];
};

// Function to get test users by department
export const getTestUsersByDepartment = (department: string): TestUser[] => {
  return testUsers.filter(user => user.department.toLowerCase() === department.toLowerCase());
};

// Function to get test users by seniority
export const getTestUsersBySeniority = (seniority: TestUser['seniority']): TestUser[] => {
  return testUsers.filter(user => user.seniority === seniority);
};

// Default test user for initial login - first user from the list
export const defaultTestUser: TestUser = testUsers[0] || {
  id: 'demo-user',
  name: 'Ana Silva',
  email: 'ana.silva@planejaplus.com',
  displayName: 'Ana',
  role: 'Product Manager',
  company: 'Planeja+',
  avatar: 'AS',
  description: 'Product Manager sênior com 8 anos de experiência em produtos digitais.',
  seniority: 'senior',
  department: 'Produto',
  emailVerified: true,
  createdAt: new Date('2024-01-15')
};