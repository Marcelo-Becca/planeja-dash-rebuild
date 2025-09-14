import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Palette, Bell, Shield, Settings as SettingsIcon, Save, Upload, Undo2 } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: "Maria Silva",
    email: "maria.silva@empresa.com",
    position: "Gerente de Projetos",
    avatar: "/placeholder.svg"
  });

  // Preferences settings
  const [preferences, setPreferences] = useState({
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    weekStart: "monday"
  });

  // Notifications settings
  const [notifications, setNotifications] = useState({
    emailTasks: true,
    emailDeadlines: true,
    emailProjects: false,
    systemTasks: true,
    systemDeadlines: true,
    systemProjects: true,
    remindersBefore: "24h"
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    accentColor: "blue",
    density: "comfortable"
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30min"
  });

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas configurações foram aplicadas.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações configuradas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Aparência atualizada",
      description: "O tema foi aplicado com sucesso.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Segurança atualizada",
      description: "Suas configurações de segurança foram salvas.",
    });
  };

  const handleDisableAllNotifications = () => {
    setNotifications(prev => ({
      ...prev,
      emailTasks: false,
      emailDeadlines: false,
      emailProjects: false,
      systemTasks: false,
      systemDeadlines: false,
      systemProjects: false
    }));
    toast({
      title: "Notificações desativadas",
      description: "Todas as notificações foram desabilitadas.",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNotifications(prev => ({
              ...prev,
              emailTasks: true,
              emailDeadlines: true,
              systemTasks: true,
              systemDeadlines: true
            }));
          }}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Desfazer
        </Button>
      ),
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência e gerencie suas preferências
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar foto
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou WEBP. Máximo 5MB.
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Uso</CardTitle>
              <CardDescription>
                Configure idioma, fuso horário e formato de exibição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={preferences.language} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, language: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, timezone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de data</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, dateFormat: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                      <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekStart">Início da semana</Label>
                  <Select value={preferences.weekStart} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, weekStart: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Segunda-feira</SelectItem>
                      <SelectItem value="sunday">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como e quando receber alertas
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisableAllNotifications}
              >
                Desativar todas
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground">Notificações por e-mail</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailTasks">Novas tarefas atribuídas</Label>
                      <p className="text-sm text-muted-foreground">Receba e-mail quando uma tarefa for atribuída a você</p>
                    </div>
                    <Switch
                      id="emailTasks"
                      checked={notifications.emailTasks}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailTasks: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailDeadlines">Lembretes de prazo</Label>
                      <p className="text-sm text-muted-foreground">E-mail antes do vencimento de tarefas</p>
                    </div>
                    <Switch
                      id="emailDeadlines"
                      checked={notifications.emailDeadlines}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailDeadlines: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailProjects">Atualizações de projetos</Label>
                      <p className="text-sm text-muted-foreground">Mudanças importantes em projetos que você participa</p>
                    </div>
                    <Switch
                      id="emailProjects"
                      checked={notifications.emailProjects}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailProjects: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground">Notificações no sistema</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemTasks">Alertas de tarefas</Label>
                      <p className="text-sm text-muted-foreground">Pop-ups e badges para novas tarefas</p>
                    </div>
                    <Switch
                      id="systemTasks"
                      checked={notifications.systemTasks}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemTasks: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemDeadlines">Avisos de prazo</Label>
                      <p className="text-sm text-muted-foreground">Notificações de tarefas próximas do vencimento</p>
                    </div>
                    <Switch
                      id="systemDeadlines"
                      checked={notifications.systemDeadlines}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemDeadlines: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemProjects">Atualizações de projetos</Label>
                      <p className="text-sm text-muted-foreground">Toasts para mudanças importantes</p>
                    </div>
                    <Switch
                      id="systemProjects"
                      checked={notifications.systemProjects}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemProjects: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remindersBefore">Lembretes antecipados</Label>
                <Select value={notifications.remindersBefore} onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, remindersBefore: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora antes</SelectItem>
                    <SelectItem value="6h">6 horas antes</SelectItem>
                    <SelectItem value="24h">24 horas antes</SelectItem>
                    <SelectItem value="48h">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar notificações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize o visual da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={appearance.theme} onValueChange={(value) => 
                    setAppearance(prev => ({ ...prev, theme: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Cor de destaque</Label>
                  <Select value={appearance.accentColor} onValueChange={(value) => 
                    setAppearance(prev => ({ ...prev, accentColor: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="density">Densidade da interface</Label>
                  <Select value={appearance.density} onValueChange={(value) => 
                    setAppearance(prev => ({ ...prev, density: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compacta</SelectItem>
                      <SelectItem value="comfortable">Confortável</SelectItem>
                      <SelectItem value="spacious">Espaçosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveAppearance} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Aplicar tema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie senha e configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm text-foreground mb-2">Alterar senha</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha atual</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova senha</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button variant="outline" size="sm">
                      Alterar senha
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor">Autenticação em duas etapas</Label>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => 
                      setSecurity(prev => ({ ...prev, twoFactor: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout da sessão</Label>
                  <Select value={security.sessionTimeout} onValueChange={(value) => 
                    setSecurity(prev => ({ ...prev, sessionTimeout: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutos</SelectItem>
                      <SelectItem value="30min">30 minutos</SelectItem>
                      <SelectItem value="1h">1 hora</SelectItem>
                      <SelectItem value="4h">4 horas</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm text-foreground mb-2">Sessões ativas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Navegador atual</p>
                        <p className="text-xs text-muted-foreground">Chrome - São Paulo, SP</p>
                      </div>
                      <span className="text-xs text-green-600">Ativa</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Encerrar todas as outras sessões
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}