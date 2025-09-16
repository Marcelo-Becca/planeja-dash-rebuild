import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Verificar validade do token ao carregar a página
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    // Simular verificação do token
    const validateToken = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular diferentes cenários
      const isValidToken = token === 'valid-reset-token-123';
      const isExpiredToken = token === 'expired-reset-token-456';
      
      if (isExpiredToken || !isValidToken) {
        setTokenValid(false);
        return;
      }
      
      setTokenValid(true);
    };
    
    validateToken();
  }, [token]);

  const validatePassword = (password: string) => {
    if (!password) return 'Nova senha é obrigatória';
    if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula';
    if (!/[a-z]/.test(password)) return 'Senha deve conter pelo menos uma letra minúscula';
    if (!/[0-9]/.test(password)) return 'Senha deve conter pelo menos um número';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Senha deve conter pelo menos um símbolo';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (confirmPassword !== formData.newPassword) return 'Senhas não coincidem';
    return '';
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    if (score < 60) return { strength: 'fraca', color: 'bg-destructive', score };
    if (score < 80) return { strength: 'média', color: 'bg-amber-500', score };
    return { strength: 'forte', color: 'bg-green-500', score };
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const passwordError = validatePassword(formData.newPassword);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    
    if (passwordError || confirmPasswordError) {
      setErrors({
        newPassword: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular redefinição de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular verificação se nova senha é igual à anterior
      const isSameAsOldPassword = formData.newPassword === '123456789A@';
      if (isSameAsOldPassword) {
        setErrors({ newPassword: 'A nova senha deve ser diferente da senha anterior' });
        return;
      }
      
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Sua senha foi alterada. Você pode fazer login agora.",
      });
      
      // Redirecionar para login após sucesso
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Senha redefinida com sucesso. Faça login com sua nova senha.' }
        });
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state enquanto verifica token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verificando link...</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto validamos seu link de redefinição
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token inválido ou expirado
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Link inválido ou expirado</h2>
              <p className="text-muted-foreground">
                O link para redefinir sua senha não é válido ou já expirou.
                Solicite um novo link para continuar.
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full">
                  Solicitar novo link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Nova senha</h1>
          <p className="text-muted-foreground">
            Defina uma senha segura para sua conta
          </p>
        </div>

        <Card className="shadow-card-hover transition-all duration-300">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={cn(
                      "pl-10 pr-10 transition-colors",
                      errors.newPassword && "border-destructive"
                    )}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-300", passwordStrength.color)}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Força: {passwordStrength.strength}
                      </span>
                    </div>
                    
                    {/* Requirements Grid */}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={cn("flex items-center space-x-1", formData.newPassword.length >= 8 ? "text-green-600" : "text-muted-foreground")}>
                        {formData.newPassword.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>8+ caracteres</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[A-Z]/.test(formData.newPassword) ? "text-green-600" : "text-muted-foreground")}>
                        {/[A-Z]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Maiúscula</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[a-z]/.test(formData.newPassword) ? "text-green-600" : "text-muted-foreground")}>
                        {/[a-z]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Minúscula</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[0-9]/.test(formData.newPassword) ? "text-green-600" : "text-muted-foreground")}>
                        {/[0-9]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Número</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[^A-Za-z0-9]/.test(formData.newPassword) ? "text-green-600" : "text-muted-foreground")}>
                        {/[^A-Za-z0-9]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>Símbolo</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={cn(
                      "pl-10 pr-10 transition-colors",
                      errors.confirmPassword && "border-destructive"
                    )}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                    <Check className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !formData.newPassword || !formData.confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redefinindo senha...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">🔒 Dica de segurança</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use uma senha única que você não usa em outros sites</li>
                <li>• Evite informações pessoais (nome, data de nascimento)</li>
                <li>• Considere usar um gerenciador de senhas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Demo Panel */}
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h4 className="font-medium text-sm">🔧 Demonstração</h4>
              <p className="text-xs text-muted-foreground">
                Teste com diferentes cenários
              </p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      newPassword: 'NovaSenh@123',
                      confirmPassword: 'NovaSenh@123',
                    });
                  }}
                  className="w-full text-xs"
                >
                  ✅ Preencher senha válida
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      newPassword: '123456789A@',
                      confirmPassword: '123456789A@',
                    });
                  }}
                  className="w-full text-xs"
                >
                  ❌ Tentar senha anterior (erro)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;