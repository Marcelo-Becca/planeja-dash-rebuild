import { useState, useCallback } from 'react';
import { Project, Task, Team, User } from '@/data/mockData';
import { testUsers } from '@/data/testUsers';
import { useAuth } from '@/contexts/AuthContext';

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

// Initial empty data for new users
const getInitialData = (): LocalStorageData => ({
  projects: [],
  tasks: [],
  teams: [],
  users: testUsers.map(tu => ({
    id: tu.id,
    name: tu.name,
    email: tu.email,
    avatar: tu.avatar || tu.name.split(' ').map(n => n[0]).join(''),
    role: tu.role
  })), // Always include test users as regular Users
  lastUpdate: new Date().toISOString()
});

// Load data from localStorage or use initial data (user-specific)
const loadData = (userId: string): LocalStorageData => {
  try {
    const stored = localStorage.getItem(`planeja-data-${userId}`);
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

// Save data to localStorage (user-specific)
const saveData = (data: LocalStorageData, userId: string) => {
  try {
    localStorage.setItem(`planeja-data-${userId}`, JSON.stringify({
      ...data,
      lastUpdate: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
};

export function useLocalData() {
  const { user } = useAuth();
  const [data, setData] = useState<LocalStorageData>(() => 
    user ? loadData(user.id) : getInitialData()
  );

  // Save to localStorage whenever data changes (only if user is logged in)
  // useEffect removed to prevent infinite re-renders, data is saved on each mutation instead
  const saveDataIfNeeded = useCallback(() => {
    if (user) {
      saveData(data, user.id);
    }
  }, [data, user]);

  // Projects
  const addProject = useCallback((projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
    };

    setData(prev => {
      const updated = {
        ...prev,
        projects: [...prev.projects, newProject]
      };
      if (user) saveData(updated, user.id);
      return updated;
    });

    return newProject;
  }, [user]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData(prev => {
      const updated = {
        ...prev,
        projects: prev.projects.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      };
      if (user) saveData(updated, user.id);
      return updated;
    });
  }, [user]);

  const deleteProject = useCallback((id: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        tasks: prev.tasks.filter(t => t.projectId !== id)
      };
      if (user) saveData(updated, user.id);
      return updated;
    });
  }, [user]);

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

      const updated = {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects
      };

      if (user) saveData(updated, user.id);
      return updated;
    });

    return newTask;
  }, [user]);

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

      const updated = {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects
      };

      if (user) saveData(updated, user.id);
      return updated;
    });
  }, [user]);

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

      const updated = {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects
      };

      if (user) saveData(updated, user.id);
      return updated;
    });
  }, [user]);

  // Teams
  const addTeam = useCallback((teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: generateId(),
    };

    setData(prev => {
      const updated = {
        ...prev,
        teams: [...prev.teams, newTeam]
      };
      if (user) saveData(updated, user.id);
      return updated;
    });

    return newTeam;
  }, [user]);

  const updateTeam = useCallback((id: string, updates: Partial<Team>) => {
    setData(prev => {
      const updated = {
        ...prev,
        teams: prev.teams.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      };
      if (user) saveData(updated, user.id);
      return updated;
    });
  }, [user]);

  const deleteTeam = useCallback((id: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        teams: prev.teams.filter(t => t.id !== id)
      };
      if (user) saveData(updated, user.id);
      return updated;
    });
  }, [user]);

  // Users
  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
    };

    setData(prev => {
      const updated = {
        ...prev,
        users: [...prev.users, newUser]
      };
      if (user) saveData(updated, user.id);
      return updated;
    });

    return newUser;
  }, [user]);

  // Utility functions
  const clearAllData = useCallback(() => {
    const initialData = getInitialData();
    setData(initialData);
    if (user) {
      localStorage.removeItem(`planeja-data-${user.id}`);
      saveData(initialData, user.id);
    }
  }, [user]);

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