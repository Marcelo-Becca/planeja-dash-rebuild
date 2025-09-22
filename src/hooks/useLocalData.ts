import { useState, useEffect, useCallback } from 'react';
import { Project, Task, Team, User, mockProjects, mockTasks, mockTeams, mockUsers } from '@/data/mockData';

// Types for local storage
interface LocalStorageData {
  projects: Project[];
  tasks: Task[];
  teams: Team[];
  users: User[];
  lastUpdate: string;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial data with mock data
const getInitialData = (): LocalStorageData => ({
  projects: [...mockProjects],
  tasks: [...mockTasks],
  teams: [...mockTeams],
  users: [...mockUsers],
  lastUpdate: new Date().toISOString()
});

// Load data from localStorage or use initial data
const loadData = (): LocalStorageData => {
  try {
    const stored = localStorage.getItem('planeja-data');
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      data.projects = data.projects.map((p: any) => ({
        ...p,
        deadline: new Date(p.deadline)
      }));
      data.tasks = data.tasks.map((t: any) => ({
        ...t,
        deadline: new Date(t.deadline),
        createdAt: new Date(t.createdAt)
      }));
      data.teams = data.teams.map((team: any) => ({
        ...team,
        createdAt: new Date(team.createdAt)
      }));
      return data;
    }
  } catch (error) {
    console.warn('Erro ao carregar dados do localStorage:', error);
  }
  return getInitialData();
};

// Save data to localStorage
const saveData = (data: LocalStorageData) => {
  try {
    localStorage.setItem('planeja-data', JSON.stringify({
      ...data,
      lastUpdate: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
};

export function useLocalData() {
  const [data, setData] = useState<LocalStorageData>(loadData);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Projects
  const addProject = useCallback((projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
    };

    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));

    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.filter(t => t.projectId !== id)
    }));
  }, []);

  // Tasks
  const addTask = useCallback((taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
    };

    setData(prev => {
      const updatedTasks = [...prev.tasks, newTask];
      
      // Update project progress if task is linked to a project
      let updatedProjects = prev.projects;
      if (newTask.projectId && newTask.projectId !== 'independent') {
        updatedProjects = prev.projects.map(project => {
          if (project.id === newTask.projectId) {
            const projectTasks = updatedTasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            return {
              ...project,
              tasksCount: projectTasks.length,
              completedTasks,
              progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
            };
          }
          return project;
        });
      }

      return {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects
      };
    });

    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData(prev => {
      const updatedTasks = prev.tasks.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );

      // Update project progress
      const task = updatedTasks.find(t => t.id === id);
      let updatedProjects = prev.projects;
      
      if (task?.projectId && task.projectId !== 'independent') {
        updatedProjects = prev.projects.map(project => {
          if (project.id === task.projectId) {
            const projectTasks = updatedTasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            return {
              ...project,
              tasksCount: projectTasks.length,
              completedTasks,
              progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
            };
          }
          return project;
        });
      }

      return {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects
      };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => {
      const taskToDelete = prev.tasks.find(t => t.id === id);
      const updatedTasks = prev.tasks.filter(t => t.id !== id);
      
      let updatedProjects = prev.projects;
      if (taskToDelete?.projectId && taskToDelete.projectId !== 'independent') {
        updatedProjects = prev.projects.map(project => {
          if (project.id === taskToDelete.projectId) {
            const projectTasks = updatedTasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            return {
              ...project,
              tasksCount: projectTasks.length,
              completedTasks,
              progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
            };
          }
          return project;
        });
      }

      return {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects
      };
    });
  }, []);

  // Teams
  const addTeam = useCallback((teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: generateId(),
    };

    setData(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam]
    }));

    return newTeam;
  }, []);

  const updateTeam = useCallback((id: string, updates: Partial<Team>) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
    }));
  }, []);

  const deleteTeam = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== id)
    }));
  }, []);

  // Users
  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
    };

    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    return newUser;
  }, []);

  // Utility functions
  const clearAllData = useCallback(() => {
    const initialData = getInitialData();
    setData(initialData);
    localStorage.removeItem('planeja-data');
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData);
      setData(imported);
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }, []);

  return {
    // Data
    projects: data.projects,
    tasks: data.tasks,
    teams: data.teams,
    users: data.users,
    lastUpdate: data.lastUpdate,

    // Projects
    addProject,
    updateProject,
    deleteProject,

    // Tasks
    addTask,
    updateTask,
    deleteTask,

    // Teams
    addTeam,
    updateTeam,
    deleteTeam,

    // Users
    addUser,

    // Utilities
    clearAllData,
    exportData,
    importData,
  };
}