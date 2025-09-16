import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ForgotPassword = () => {
  const { resetPassword, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'E-mail é obrigatório';
    if (!emailRegex.test(email)) return 'Formato de e-mail inválido';
    return '';
  };

  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(60);
    
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
      startResendCountdown();
      setError('');
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await resetPassword(email);
      startResendCountdown();
      setError('');
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="shadow-card-hover transition-all duration-300">
            <CardContent className="pt-8 text-center space-y-6">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">E-mail enviado!</h1>
                <p className="text-muted-foreground">
                  Enviamos instruções para redefinir sua senha para:
                </p>
                <p className="font-medium text-foreground">{email}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <h3 className="font-medium text-sm">📧 Verifique sua caixa de entrada</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Procure por um e-mail de "Planeja+"</li>
                  <li>• Verifique a pasta de spam/lixo eletrônico</li>
                  <li>• O link é válido por 15 minutos</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  variant="outline"
                  disabled={!canResend || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Reenviar e-mail
                      {!canResend && ` (${resendCountdown}s)`}
                    </>
                  )}
                </Button>

                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Não recebeu o e-mail? Entre em contato com o suporte em{' '}
                  <Link 
                    to="/support" 
                    className="text-primary hover:text-primary/80 underline"
                  >
                    suporte@planeja.com
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Esqueci minha senha</h1>
          <p className="text-muted-foreground">
            Digite seu e-mail para receber instruções de redefinição
          </p>
        </div>

        <Card className="shadow-card-hover transition-all duration-300">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail ou nome de usuário</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="seu@email.com ou usuario"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={cn(
                      "pl-10 transition-colors",
                      error && "border-destructive"
                    )}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive animate-fade-in">{error}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando instruções...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">💡 Dica de segurança</h4>
              <p className="text-xs text-muted-foreground">
                Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam. 
                O link de redefinição expira em 15 minutos por segurança.
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h4 className="font-medium">Outras opções de recuperação</h4>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full text-sm">
                  🔗 Receber link mágico por e-mail
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-sm">
                  📱 Usar autenticação por SMS
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recursos disponíveis após ativação
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;