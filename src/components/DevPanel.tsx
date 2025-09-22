import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code, Settings, Users, Mail, FileText, X, Eye, EyeOff } from "lucide-react";
import TestUserSwitcher from "./TestUserSwitcher";
import { useAuth } from "@/contexts/AuthContext";

interface DevPanelProps {
  isVisible?: boolean;
}

export default function DevPanel({ isVisible = false }: DevPanelProps) {
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(isVisible);
  const { user } = useAuth();

  // Check for dev mode activation via URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const devMode = urlParams.get('dev') === '1' || localStorage.getItem('devMode') === 'true';
    
    if (devMode || isVisible) {
      setPanelVisible(true);
    }
  }, [isVisible]);

  const handleQuickFillLogin = () => {
    // Dispatch custom event for login form
    window.dispatchEvent(new CustomEvent('devQuickFillLogin', {
      detail: {
        email: 'joao@exemplo.com',
        password: '123456789A@'
      }
    }));
  };

  const handleQuickFillRegister = () => {
    // Dispatch custom event for register form
    window.dispatchEvent(new CustomEvent('devQuickFillRegister', {
      detail: {
        name: 'Maria Silva',
        email: 'maria@exemplo.com',
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123'
      }
    }));
  };

  const toggleDevMode = () => {
    const newState = !panelVisible;
    setPanelVisible(newState);
    localStorage.setItem('devMode', newState.toString());
    
    if (!newState) {
      // Remove URL param if disabling
      const url = new URL(window.location.href);
      url.searchParams.delete('dev');
      window.history.replaceState({}, '', url);
    }
  };

  if (!panelVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDevMode}
        className="fixed bottom-2 left-2 z-50 opacity-20 hover:opacity-100 transition-opacity"
      >
        <Code className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Dev Mode Indicator */}
      <div className="fixed top-2 right-2 z-50">
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          <Code className="w-3 h-3 mr-1" />
          Dev Mode
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDevMode}
            className="ml-1 h-auto p-0 hover:bg-transparent"
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      </div>

      {/* Dev Panel Trigger */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-2 left-2 z-50 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Painel Dev
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Painel de Desenvolvimento
            </DialogTitle>
            <DialogDescription>
              Ferramentas e simulações para desenvolvimento e testes.
              <br />
              <strong>Usuário atual:</strong> {user?.name || 'Não logado'} ({user?.role || 'N/A'})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* User Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Usuários de Teste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Alterne entre diferentes perfis de usuário para testar funcionalidades.
                  </p>
                  <TestUserSwitcher />
                </div>
              </CardContent>
            </Card>

            {/* Form Helpers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Preenchimento Automático
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Preencha formulários automaticamente com dados de teste.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleQuickFillLogin}
                      className="justify-start"
                    >
                      💡 Preencher Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleQuickFillRegister}
                      className="justify-start"
                    >
                      💡 Preencher Cadastro
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Verification Simulator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="w-5 h-5" />
                  Simulador de Verificação (Removido)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    A funcionalidade de verificação de e-mail foi removida da interface pública.
                    Todos os usuários são considerados verificados automaticamente.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-xs opacity-50"
                    >
                      ✅ Link válido (removido)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-xs opacity-50"
                    >
                      ⏰ Link expirado (removido)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-xs opacity-50"
                    >
                      ❌ Link inválido (removido)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Dev Instructions */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">📋 Instruções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p><strong>Como ativar:</strong> Adicione ?dev=1 na URL ou use o botão toggle</p>
                  <p><strong>Funcionalidades removidas da interface pública:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Tela de verificação de e-mail (/verify-email)</li>
                    <li>Botões "Preencher dados de demonstração" públicos</li>
                    <li>Badge "Modo demonstrativo" em login/cadastro</li>
                    <li>"Trocar Usuário" no menu de perfil público</li>
                    <li>Painéis de demonstração públicos</li>
                  </ul>
                  <p><strong>Comportamento atual:</strong> Cadastro loga automaticamente sem verificação</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}