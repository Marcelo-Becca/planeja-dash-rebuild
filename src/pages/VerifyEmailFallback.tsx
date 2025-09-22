import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmailFallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card-hover transition-all duration-300">
          <CardContent className="pt-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Verificação não necessária</h1>
              <p className="text-muted-foreground">
                A verificação por e-mail foi removida nesta versão. 
                {user ? 'Sua conta já está ativa!' : 'Continue navegando normalmente.'}
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para o Dashboard
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Redirecionando automaticamente em 3 segundos...
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                Se você esperava uma tela de verificação, isso significa que a funcionalidade 
                foi simplificada. Entre em contato com o suporte se tiver dúvidas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailFallback;