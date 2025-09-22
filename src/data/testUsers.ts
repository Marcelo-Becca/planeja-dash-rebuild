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

// Test users - cleared as requested (backup saved in backup_removed_data.json)
export const testUsers: TestUser[] = [];

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

// Default test user for initial login - using placeholder after cleanup
export const defaultTestUser: TestUser = {
  id: 'demo-user',
  name: 'Usuário Demo',
  email: 'demo@planejaplus.com',
  displayName: 'Demo',
  role: 'Usuário',
  company: 'Planeja+',
  avatar: 'UD',
  description: 'Usuário de demonstração do sistema',
  seniority: 'pleno',
  department: 'Demonstração',
  emailVerified: true,
  createdAt: new Date()
};