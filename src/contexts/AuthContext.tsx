import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { name?: string; role?: string; avatar?: string }) => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_ATTEMPTS_KEY = 'planeja_login_attempts';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return profile;
  };

  // Initialize Supabase auth listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch profile data when user is authenticated
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            if (profile) {
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name || '',
                displayName: profile.display_name,
                phone: profile.phone,
                role: profile.role,
                company: profile.company,
                avatar: profile.avatar,
                emailVerified: true,
                createdAt: new Date(profile.created_at),
              };
              setUser(userData);
              setIsEmailVerified(true);
            }
          }, 0);
        } else {
          setUser(null);
          setIsEmailVerified(false);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || '',
              displayName: profile.display_name,
              phone: profile.phone,
              role: profile.role,
              company: profile.company,
              avatar: profile.avatar,
              emailVerified: true,
              createdAt: new Date(profile.created_at),
            };
            setUser(userData);
            setIsEmailVerified(true);
          }
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({
          count: newAttempts,
          timestamp: Date.now()
        }));

        if (newAttempts >= 5) {
          setIsBlocked(true);
          startBlockTimer(120000);
          throw new Error('Muitas tentativas de login. Conta temporariamente bloqueada por 2 minutos.');
        }
        
        throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error.message);
      }

      setLoginAttempts(0);
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta!`,
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
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            displayName: userData.displayName,
            role: userData.role,
            company: userData.company,
            phone: userData.phone,
          }
        }
      });

      if (error) {
        throw new Error(error.message === 'User already registered' ? 'E-mail já cadastrado. Faça login ou recupere sua senha.' : error.message);
      }

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
      
      
      toast({
        title: "Verificação simulada",
        description: "Para compatibilidade dev - usuário verificado.",
      });
    }
    return Promise.resolve();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsEmailVerified(false);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const updateProfile = async (updates: { name?: string; role?: string; avatar?: string }) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.role && { role: updates.role }),
        ...(updates.avatar && { avatar: updates.avatar }),
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const updatedUser = {
      ...user,
      ...(updates.name && { name: updates.name }),
      ...(updates.role && { role: updates.role }),
      ...(updates.avatar && { avatar: updates.avatar }),
    };
    
    setUser(updatedUser);
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
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}