import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { testUsers, defaultTestUser, type TestUser } from '@/data/testUsers';

interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  phone?: string;
  role?: string;
  company?: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  testUsers: TestUser[];
  switchToTestUser: (testUser: TestUser) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  // Email verification methods (deprecated - kept for dev compatibility)
  verifyEmail: (token?: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
  loginAttempts: number;
  isBlocked: boolean;
  blockTimeRemaining: number;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  displayName?: string;
  phone?: string;
  role?: string;
  company?: string;
  preferences?: {
    emailTips: boolean;
    emailReports: boolean;
    newsletter: boolean;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simulação de base de dados local
const MOCK_USERS_KEY = 'planeja_mock_users';
const CURRENT_USER_KEY = 'planeja_current_user';
const LOGIN_ATTEMPTS_KEY = 'planeja_login_attempts';

// Usuário padrão para demonstração
const DEMO_USER: User = defaultTestUser;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  // Carregar usuário do localStorage ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsEmailVerified(userData.emailVerified);
    }
    
    if (attempts) {
      const attemptsData = JSON.parse(attempts);
      if (attemptsData.count >= 5 && Date.now() - attemptsData.timestamp < 120000) {
        setIsBlocked(true);
        setLoginAttempts(attemptsData.count);
        startBlockTimer(120000 - (Date.now() - attemptsData.timestamp));
      }
    }
  }, []);

  const startBlockTimer = (initialTime: number) => {
    setBlockTimeRemaining(Math.ceil(initialTime / 1000));
    const timer = setInterval(() => {
      setBlockTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBlocked(false);
          setLoginAttempts(0);
          localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulateDelay = (ms: number = 1500) => new Promise(resolve => setTimeout(resolve, ms));

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    if (isBlocked) {
      throw new Error(`Muitas tentativas de login. Tente novamente em ${blockTimeRemaining} segundos.`);
    }

    setIsLoading(true);
    
    try {
      await simulateDelay();
      
      // Simular validação de credenciais
      const isValidCredential = (
        (email === 'demo@planejaplus.com' || email === 'demo') && password === 'Demo123!' ||
        testUsers.some(testUser => 
          (testUser.email === email || testUser.name.toLowerCase() === email.toLowerCase()) && 
          password === 'Test123!'
        )
      );

      if (!isValidCredential) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({
          count: newAttempts,
          timestamp: Date.now()
        }));

        if (newAttempts >= 5) {
          setIsBlocked(true);
          startBlockTimer(120000); // 2 minutos
          throw new Error('Muitas tentativas de login. Conta temporariamente bloqueada por 2 minutos.');
        }
        
        throw new Error('E-mail ou senha incorretos');
      }

      // Login bem-sucedido
      let loggedUser: User;
      
      // Check if it's a test user login
      const testUser = testUsers.find(tu => 
        tu.email === email || tu.name.toLowerCase() === email.toLowerCase()
      );
      
      if (testUser) {
        loggedUser = testUser;
      } else {
        loggedUser = { ...DEMO_USER };
      }
      
      // Email verification check removed - all users are auto-verified

      setUser(loggedUser);
      setIsEmailVerified(true);
      setLoginAttempts(0);
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      
      if (rememberMe) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${loggedUser.name}`,
      });

    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    
    try {
      await simulateDelay(2000);
      
      // Simular verificação de e-mail existente
      if (testUsers.some(tu => tu.email === userData.email) || userData.email === 'teste@existe.com') {
        throw new Error('E-mail já cadastrado. Faça login ou recupere sua senha.');
      }

      // Criar novo usuário já verificado
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        displayName: userData.displayName,
        phone: userData.phone,
        role: userData.role,
        company: userData.company,
        emailVerified: true, // Auto-verified in public environment
        createdAt: new Date(),
      };

      // Salvar na "base de dados" local
      const existingUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      existingUsers.push(newUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      
      setUser(newUser);
      setIsEmailVerified(true);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já está logado. Bem-vindo ao Planeja+!",
      });

    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchToTestUser = (testUser: TestUser) => {
    const user: User = testUser;
    setUser(user);
    setIsEmailVerified(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    toast({
      title: "Usuário alterado",
      description: `Agora você está logado como ${testUser.name}`,
    });
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      await simulateDelay();
      
      // Simular envio de e-mail
      toast({
        title: "E-mail de recuperação enviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });

    } catch (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deprecated: Email verification removed from public interface
  const verifyEmail = async (token?: string) => {
    // Legacy compatibility for dev tools
    if (user && !user.emailVerified) {
      const updatedUser = { ...user, emailVerified: true };
      setUser(updatedUser);
      setIsEmailVerified(true);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      toast({
        title: "Verificação simulada",
        description: "Para compatibilidade dev - usuário verificado.",
      });
    }
    return Promise.resolve();
  };

  const logout = () => {
    setUser(null);
    setIsEmailVerified(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  // Deprecated: Email verification removed from public interface
  const resendVerificationEmail = async () => {
    // Legacy compatibility - no-op for dev tools
    toast({
      title: "Funcionalidade removida",
      description: "Verificação por e-mail não é mais necessária.",
    });
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        testUsers,
        switchToTestUser,
        login,
        register,
        logout,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        isEmailVerified,
        loginAttempts,
        isBlocked,
        blockTimeRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};