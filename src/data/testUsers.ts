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

export const testUsers: TestUser[] = [
  {
    id: 'test-user-001',
    name: 'Ana Clara Ferreira',
    email: 'ana.ferreira@planejaplus.com',
    displayName: 'Ana Clara',
    role: 'Product Manager',
    company: 'Planeja+',
    avatar: 'AF',
    description: 'Especialista em gestão de produtos digitais com foco em UX e métricas de negócio.',
    seniority: 'senior',
    department: 'Produto',
    emailVerified: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'test-user-002',
    name: 'Bruno Santos Lima',
    email: 'bruno.lima@planejaplus.com',
    displayName: 'Bruno',
    role: 'Desenvolvedor Frontend',
    company: 'Planeja+',
    avatar: 'BL',
    description: 'Desenvolvedor especializado em React, TypeScript e design systems.',
    seniority: 'pleno',
    department: 'Tecnologia',
    emailVerified: true,
    createdAt: new Date('2023-03-10')
  },
  {
    id: 'test-user-003',
    name: 'Carla Mendes Silva',
    email: 'carla.mendes@planejaplus.com',
    displayName: 'Carla',
    role: 'Designer UX/UI',
    company: 'Planeja+',
    avatar: 'CS',
    description: 'Designer focada em experiência do usuário e interfaces intuitivas.',
    seniority: 'junior',
    department: 'Design',
    emailVerified: true,
    createdAt: new Date('2023-06-20')
  },
  {
    id: 'test-user-004',
    name: 'Diego Rodrigues Costa',
    email: 'diego.costa@planejaplus.com',
    displayName: 'Diego',
    role: 'Analista de Dados',
    company: 'Planeja+',
    avatar: 'DC',
    description: 'Especialista em análise de dados, BI e métricas de performance.',
    seniority: 'senior',
    department: 'Dados',
    emailVerified: true,
    createdAt: new Date('2022-11-08')
  },
  {
    id: 'test-user-005',
    name: 'Eduarda Oliveira Paz',
    email: 'eduarda.paz@planejaplus.com',
    displayName: 'Eduarda',
    role: 'Desenvolvedora Backend',
    company: 'Planeja+',
    avatar: 'EP',
    description: 'Desenvolvedora backend especializada em Node.js, APIs e microsserviços.',
    seniority: 'pleno',
    department: 'Tecnologia',
    emailVerified: true,
    createdAt: new Date('2023-02-14')
  },
  {
    id: 'test-user-006',
    name: 'Fernando Alves Ribeiro',
    email: 'fernando.ribeiro@planejaplus.com',
    displayName: 'Fernando',
    role: 'Gerente de Projetos',
    company: 'Planeja+',
    avatar: 'FR',
    description: 'Gerente de projetos com certificação PMP e experiência em metodologias ágeis.',
    seniority: 'senior',
    department: 'Gestão',
    emailVerified: true,
    createdAt: new Date('2022-08-12')
  },
  {
    id: 'test-user-007',
    name: 'Gabriela Torres Melo',
    email: 'gabriela.melo@planejaplus.com',
    displayName: 'Gabi',
    role: 'Estagiária de Design',
    company: 'Planeja+',
    avatar: 'GM',
    description: 'Estudante de Design Gráfico aprendendo UX/UI e design de produtos.',
    seniority: 'estagiario',
    department: 'Design',
    emailVerified: true,
    createdAt: new Date('2023-08-15')
  },
  {
    id: 'test-user-008',
    name: 'Henrique Castro Nunes',
    email: 'henrique.nunes@planejaplus.com',
    displayName: 'Henrique',
    role: 'QA Analyst',
    company: 'Planeja+',
    avatar: 'HN',
    description: 'Analista de qualidade especializado em testes automatizados e manuais.',
    seniority: 'pleno',
    department: 'Qualidade',
    emailVerified: true,
    createdAt: new Date('2023-04-05')
  },
  {
    id: 'test-user-009',
    name: 'Isabela Martins Gomes',
    email: 'isabela.gomes@planejaplus.com',
    displayName: 'Isa',
    role: 'DevOps Engineer',
    company: 'Planeja+',
    avatar: 'IG',
    description: 'Engenheira DevOps especializada em AWS, Docker e automação de deploy.',
    seniority: 'senior',
    department: 'Infraestrutura',
    emailVerified: true,
    createdAt: new Date('2022-12-20')
  },
  {
    id: 'test-user-010',
    name: 'João Pedro Barbosa',
    email: 'joao.barbosa@planejaplus.com',
    displayName: 'JP',
    role: 'Scrum Master',
    company: 'Planeja+',
    avatar: 'JB',
    description: 'Scrum Master certificado, facilitador ágil e coach de equipes.',
    seniority: 'pleno',
    department: 'Agilidade',
    emailVerified: true,
    createdAt: new Date('2023-01-30')
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

// Default test user for initial login
export const defaultTestUser = testUsers[0]; // Ana Clara Ferreira