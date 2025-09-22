import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import DevPanel from '@/components/DevPanel';

interface FormData {
  name: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
  company: string;
  acceptTerms: boolean;
  preferences: {
    emailTips: boolean;
    emailReports: boolean;
    newsletter: boolean;
  };
}

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    company: '',
    acceptTerms: false,
    preferences: {
      emailTips: true,
      emailReports: false,
      newsletter: false,
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validações
  const validateName = (name: string) => {
    if (!name) return 'Nome é obrigatório';
    if (name.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length < 2) return 'Digite pelo menos nome e sobrenome';
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'E-mail é obrigatório';
    if (!emailRegex.test(email)) return 'Formato de e-mail inválido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula';
    if (!/[a-z]/.test(password)) return 'Senha deve conter pelo menos uma letra minúscula';
    if (!/[0-9]/.test(password)) return 'Senha deve conter pelo menos um número';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Senha deve conter pelo menos um símbolo';
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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (confirmPassword !== formData.password) return 'Senhas não coincidem';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone)) {
      return 'Formato inválido. Use: (11) 99999-9999';
    }
    return '';
  };

  const handleInputChange = (field: keyof FormData | string, value: string | boolean) => {
    if (field.startsWith('preferences.')) {
      const prefKey = field.split('.')[1] as keyof FormData['preferences'];
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [prefKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return value;
  };

  const canProceedToStep2 = () => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    
    return !nameError && !emailError && !passwordError && !confirmPasswordError;
  };

  const handleNextStep = () => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    
    if (canProceedToStep2()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      setErrors(prev => ({ ...prev, acceptTerms: 'Você deve aceitar os termos para continuar' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || undefined,
        phone: formData.phone || undefined,
        role: formData.role || undefined,
        company: formData.company || undefined,
        preferences: formData.preferences,
      });
      
      // Redirect to dashboard instead of email verification
      navigate('/');
    } catch (error) {
      // Erros já tratados no contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dev mode quick fill handler
  useEffect(() => {
    const handleDevQuickFill = (event: CustomEvent) => {
      setFormData(prev => ({
        ...prev,
        name: event.detail.name,
        email: event.detail.email,
        password: event.detail.password,
        confirmPassword: event.detail.confirmPassword,
        acceptTerms: true,
      }));
    };

    window.addEventListener('devQuickFillRegister', handleDevQuickFill as EventListener);
    return () => window.removeEventListener('devQuickFillRegister', handleDevQuickFill as EventListener);
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Criar conta</h1>
          <p className="text-muted-foreground">Comece a organizar suas tarefas em minutos</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Passo {step} de 2</span>
            <span>{step === 1 ? 'Dados básicos' : 'Informações adicionais'}</span>
          </div>
          <Progress value={step * 50} className="h-2" />
        </div>

        <Card className="shadow-card-hover transition-all duration-300">
          {step === 1 && (
            <>
              <CardHeader className="pb-6">
                {/* Dev mode indicator removed from public interface */}
              </CardHeader>

              <CardContent>
                <form className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Ex.: João Silva"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={cn("pl-10", errors.name && "border-destructive")}
                      />
                      {formData.name && !errors.name && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive animate-fade-in">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={cn("pl-10", errors.email && "border-destructive")}
                      />
                      {formData.email && !errors.email && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {formData.password && (
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
                        
                        {/* Requirements */}
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className={cn("flex items-center space-x-1", formData.password.length >= 8 ? "text-green-600" : "text-muted-foreground")}>
                            {formData.password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>8+ caracteres</span>
                          </div>
                          <div className={cn("flex items-center space-x-1", /[A-Z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground")}>
                            {/[A-Z]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Maiúscula</span>
                          </div>
                          <div className={cn("flex items-center space-x-1", /[a-z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground")}>
                            {/[a-z]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Minúscula</span>
                          </div>
                          <div className={cn("flex items-center space-x-1", /[0-9]/.test(formData.password) ? "text-green-600" : "text-muted-foreground")}>
                            {/[0-9]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Número</span>
                          </div>
                          <div className={cn("flex items-center space-x-1", /[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : "text-muted-foreground")}>
                            {/[^A-Za-z0-9]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Símbolo</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Digite a senha novamente"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={cn("pl-10 pr-10", errors.confirmPassword && "border-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <Check className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive animate-fade-in">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    size="lg"
                    className="w-full"
                    disabled={!canProceedToStep2()}
                  >
                    Próximo passo
                  </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-center text-xs text-muted-foreground">
                    Ative o modo desenvolvedor para ferramentas de preenchimento automático.
                  </p>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                    Fazer login
                  </Link>
                </p>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold">Informações adicionais</h3>
                  <p className="text-sm text-muted-foreground">Complete seu perfil (opcional)</p>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de exibição</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      placeholder="Como você gostaria de ser chamado?"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usado em comentários e menções</p>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo / Função</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="role"
                      placeholder="Ex.: Product Manager"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Nome da empresa / organização</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Ex.: Padaria do Bairro (MEI)"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                      className={cn("pl-10", errors.phone && "border-destructive")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive animate-fade-in">{errors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Apenas se quiser adicionar contato</p>
                </div>
                {/* Preferences */}
                <div className="space-y-3">
                  <Label>Preferências de comunicação</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailTips"
                        checked={formData.preferences.emailTips}
                        onCheckedChange={(checked) => handleInputChange('preferences.emailTips', checked as boolean)}
                      />
                      <Label htmlFor="emailTips" className="text-sm">
                        Quero receber dicas e novidades (email)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailReports"
                        checked={formData.preferences.emailReports}
                        onCheckedChange={(checked) => handleInputChange('preferences.emailReports', checked as boolean)}
                      />
                      <Label htmlFor="emailReports" className="text-sm">
                        Quero relatórios semanais por email
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      Aceito os{' '}
                      <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                        termos de uso
                      </Link>{' '}
                      e{' '}
                      <Link to="/privacy" className="text-primary hover:text-primary/80 underline">
                        política de privacidade
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-destructive animate-fade-in">{errors.acceptTerms}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || isLoading || !formData.acceptTerms}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Quick Account Option */}
        {step === 1 && (
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h4 className="font-medium">Criar conta rápida</h4>
                <p className="text-sm text-muted-foreground">
                  Apenas Nome + E-mail + aceitar termos. Complete o perfil depois.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      name: 'Maria Silva',
                      email: 'maria.demo@planeja.com',
                      password: 'MinhaSenh@123',
                      confirmPassword: 'MinhaSenh@123',
                      acceptTerms: true,
                    }));
                    setStep(2);
                  }}
                >
                  Criar conta rápida
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dev Panel */}
        <DevPanel />
      </div>
    </div>
  );
};

export default Register;