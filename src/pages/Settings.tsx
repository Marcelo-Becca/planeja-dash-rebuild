import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { User, Lock, Settings as SettingsIcon, Save, Upload } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Profile settings initialized from auth user
  const [profile, setProfile] = useState({
    name: "",
    position: "",
    avatar: ""
  });

  // Password change settings
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Basic preferences
  const [preferences, setPreferences] = useState({
    showDailyTips: true,
    showDeadlineReminders: true
  });

  // Initialize profile data from auth user
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        position: user.role || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro na senha",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwords.new.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Reset password fields after success
    setPasswords({ current: "", new: "", confirm: "" });
    
    toast({
      title: "Senha atualizada",
      description: "Sua senha foi alterada com sucesso.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas configurações foram aplicadas.",
    });
  };

  // Generate avatar initials from name
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências do sistema
            </p>
          </div>

          <div className="space-y-6">
            {/* Bloco 1: Informações do Usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Usuário
                </CardTitle>
                <CardDescription>
                  Atualize sua foto de perfil e informações básicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="text-lg bg-gradient-brand text-sidebar-primary-foreground">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="mb-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Trocar foto
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Clique para enviar uma nova foto
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo ou Função</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Ex: Gerente de Projetos"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="min-w-[140px]">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bloco 2: Segurança de Acesso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança de Acesso
                </CardTitle>
                <CardDescription>
                  Altere sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    placeholder="Digite sua nova senha"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleUpdatePassword} 
                    className="min-w-[140px]"
                    disabled={!passwords.current || !passwords.new || !passwords.confirm}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Atualizar senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bloco 3: Preferências Básicas de Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Preferências Básicas de Sistema
                </CardTitle>
                <CardDescription>
                  Configure as opções essenciais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="dailyTips" className="text-base font-medium">
                      Dicas de hoje
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir dicas rápidas no dashboard para melhorar sua produtividade
                    </p>
                  </div>
                  <Switch
                    id="dailyTips"
                    checked={preferences.showDailyTips}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, showDailyTips: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="deadlineReminders" className="text-base font-medium">
                      Lembretes de prazos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar avisos visuais de tarefas e projetos próximos do vencimento
                    </p>
                  </div>
                  <Switch
                    id="deadlineReminders"
                    checked={preferences.showDeadlineReminders}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, showDeadlineReminders: checked }))
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePreferences} variant="outline" className="min-w-[140px]">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer com status */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}