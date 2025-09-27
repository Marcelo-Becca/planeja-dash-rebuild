import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { testUsers, defaultTestUser, type TestUser } from '@/data/testUsers';
import { supabase } from '@/integrations/supabase/client';
import { validateEmailSecurity, validatePasswordSecurity, checkAccountSecurityFlags, generateSecurityReport } from '@/utils/security';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  supabaseUser?: SupabaseUser;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  // Initialize Supabase auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        
        if (session?.user) {
          // Load user profile from profiles table
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error('Error loading profile:', error);
              throw error;
            }
            
            const userData: User = {
              id: session.user.id,
              name: profile?.full_name || session.user.email?.split('@')[0] || 'Usuario',
              email: session.user.email || '',
              displayName: profile?.full_name || undefined,
              company: profile?.company || undefined,
              avatar: profile?.avatar_url || undefined,
              role: profile?.role || 'member',
              emailVerified: session.user.email_confirmed_at !== null,
              createdAt: new Date(session.user.created_at),
              supabaseUser: session.user,
            };
            
            setUser(userData);
            setIsEmailVerified(userData.emailVerified);
          } catch (error) {
            console.error('Error setting up user:', error);
            setUser(null);
            setIsEmailVerified(false);
          }
        } else {
          setUser(null);
          setIsEmailVerified(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // The onAuthStateChange handler will handle this
    });

    // Load login attempts
    const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (attempts) {
      const attemptsData = JSON.parse(attempts);
      if (attemptsData.count >= 5 && Date.now() - attemptsData.timestamp < 120000) {
        setIsBlocked(true);
        setLoginAttempts(attemptsData.count);
        startBlockTimer(120000 - (Date.now() - attemptsData.timestamp));
      }
    }

    return () => subscription.unsubscribe();
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
      // Validate required fields
      if (!userData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!userData.email?.trim()) {
        throw new Error('E-mail é obrigatório');
      }
      if (!userData.password?.trim()) {
        throw new Error('Senha é obrigatória');
      }

      // Validate email format and security
      const emailValidation = validateEmailSecurity(userData.email.trim());
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.reason || 'E-mail inválido');
      }

      // Validate password security
      const passwordValidation = validatePasswordSecurity(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.issues[0] || 'Senha muito fraca');
      }

      // Normalize email
      const normalizedEmail = userData.email.trim().toLowerCase();
      
      // Split name into parts for validation
      const nameParts = userData.name.trim().split(' ').filter(part => part.length > 0);
      if (nameParts.length < 2) {
        throw new Error('Digite pelo menos nome e sobrenome');
      }

      console.log('Attempting to register user:', normalizedEmail);

      // Create user with Supabase Auth - this automatically hashes the password
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.name.trim(),
            display_name: userData.displayName?.trim(),
            phone: userData.phone?.trim(),
            company: userData.company?.trim(),
            role: userData.role || 'member',
            preferences: userData.preferences || {
              emailTips: true,
              emailReports: false,
              newsletter: false,
            }
          }
        }
      });

      if (error) {
        console.error('Supabase registration error:', error);
        
        // Handle specific registration errors
        if (error.message.includes('User already registered')) {
          throw new Error('E-mail já cadastrado. Faça login ou recupere sua senha.');
        } else if (error.message.includes('Password should be')) {
          throw new Error('Senha deve ter pelo menos 6 caracteres');
        } else if (error.message.includes('Unable to validate email')) {
          throw new Error('E-mail inválido ou temporário');
        } else {
          throw new Error(error.message);
        }
      }

      console.log('Registration successful, user created:', data.user?.id);

      // Log security information for audit
      if (data.user) {
        const securityFlags = checkAccountSecurityFlags(new Date(data.user.created_at));
        const securityReport = generateSecurityReport({
          id: data.user.id,
          email: normalizedEmail,
          created_at: data.user.created_at,
          email_confirmed_at: data.user.email_confirmed_at,
          ...securityFlags
        });
        console.log('User registration security report:', securityReport);
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: data.user?.email_confirmed_at 
          ? "Você já está logado. Bem-vindo ao Planeja+!" 
          : "Verifique seu e-mail para ativar a conta.",
      });

    } catch (error) {
      console.error('Registration error:', error);
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
    // For development only - switch to mock user while keeping real auth
    const user: User = {
      ...testUser,
      supabaseUser: session?.user,
    };
    setUser(user);
    setIsEmailVerified(true);
    
    toast({
      title: "Modo desenvolvedor",
      description: `Interface alterada para ${testUser.name} (dados fictícios)`,
    });
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Validate email format
      const emailValidation = validateEmailSecurity(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.reason || 'E-mail inválido');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "E-mail de recuperação enviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });

    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro ao enviar e-mail",
        description: error instanceof Error ? error.message : "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deprecated: Email verification removed from public interface
  const verifyEmail = async (token?: string) => {
    // Legacy compatibility for dev tools - in real implementation, 
    // email verification is handled by Supabase automatically
    if (user && !user.emailVerified) {
      toast({
        title: "E-mail verificado",
        description: "Sua conta foi verificada com sucesso.",
      });
    }
    return Promise.resolve();
  };

  const resendVerificationEmail = async () => {
    if (session?.user?.email) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: session.user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "E-mail reenviado",
          description: "Verifique sua caixa de entrada.",
        });
      } catch (error) {
        toast({
          title: "Erro ao reenviar e-mail",
          description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
    }
    return Promise.resolve();
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      setIsEmailVerified(false);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Erro ao desconectar",
        variant: "destructive",
      });
    }
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