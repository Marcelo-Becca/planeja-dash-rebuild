import { useState } from 'react';
import { 
  Bug, 
  Database, 
  Download, 
  Eye, 
  FileText, 
  Mail, 
  RefreshCw, 
  Settings,
  Trash2,
  Upload,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';
import { Invitation, InvitationActivity } from '@/types/invitation';
import { User as UserType } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvitationDevPanelProps {
  currentUser: UserType;
}

export function InvitationDevPanel({ currentUser }: InvitationDevPanelProps) {
  const { 
    invitations, 
    activities, 
    clearAllData, 
    acceptInvitation, 
    cancelInvitation 
  } = useInvitations();
  const { toast } = useToast();
  
  const [simulatedEmail, setSimulatedEmail] = useState('teste@exemplo.com');
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  // Export invitations data
  const handleExport = () => {
    const data = {
      invitations,
      activities,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.id
    };
    const jsonData = JSON.stringify(data, null, 2);
    setExportData(jsonData);
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonData);
    toast({
      title: "Dados exportados",
      description: "Dados copiados para a área de transferência."
    });
  };

  // Import invitations data (for testing)
  const handleImport = () => {
    try {
      if (!importData.trim()) {
        toast({
          title: "Erro",
          description: "Insira dados válidos para importar.",
          variant: "destructive"
        });
        return;
      }

      const data = JSON.parse(importData);
      
      // Validate structure
      if (!data.invitations || !Array.isArray(data.invitations)) {
        throw new Error('Estrutura de dados inválida');
      }

      // Here you would implement the import logic
      // For now, just show a success message
      toast({
        title: "Importação simulada",
        description: "Funcionalidade de importação será implementada em versão futura."
      });
      
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Dados inválidos ou estrutura incorreta.",
        variant: "destructive"
      });
    }
  };

  // Force accept invitation (for testing)
  const handleForceAccept = async (invitationId: string) => {
    const result = await acceptInvitation(invitationId, currentUser);
    if (result.success) {
      toast({
        title: "Convite aceito (forçado)",
        description: "Convite aceito via painel de desenvolvimento."
      });
    }
  };

  // Generate test invitation preview
  const generateEmailPreview = () => {
    return `
Para: ${simulatedEmail}
Assunto: Você foi convidado para colaborar

Olá,

{REMETENTE} convidou você para participar de "{ORGANIZAÇÃO}" como {PAPEL}.

{MENSAGEM_PERSONALIZADA}

Para aceitar este convite, clique no link abaixo:
{LINK_CONVITE}

Este convite expira em {DIAS} dias.

Atenciosamente,
Equipe Planeja+

---
Este é um e-mail simulado para fins de desenvolvimento.
Nenhum e-mail real foi enviado.
    `.trim();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Painel de Desenvolvimento - Convites
        </CardTitle>
        <CardDescription>
          Ferramentas de simulação e teste para o sistema de convites
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="simulation">Simulação</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{invitations.length}</p>
                      <p className="text-xs text-muted-foreground">Total Convites</p>
                    </div>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {invitations.filter(inv => inv.status === 'pending').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {invitations.filter(inv => inv.status === 'accepted').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Aceitos</p>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{activities.length}</p>
                      <p className="text-xs text-muted-foreground">Atividades</p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Convites Ativos</h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {invitations.slice(0, 10).map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{invitation.recipientEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          {invitation.target.name} • {invitation.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          invitation.status === 'pending' ? 'secondary' :
                          invitation.status === 'accepted' ? 'default' : 'outline'
                        }>
                          {invitation.status}
                        </Badge>
                        {invitation.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleForceAccept(invitation.id)}
                          >
                            Forçar Aceitar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sim-email">E-mail de Simulação</Label>
                <Input
                  id="sim-email"
                  value={simulatedEmail}
                  onChange={(e) => setSimulatedEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar E-mail Simulado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Preview do E-mail de Convite</DialogTitle>
                    <DialogDescription>
                      Esta é uma simulação do e-mail que seria enviado. Nenhum e-mail real é enviado.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                      {generateEmailPreview()}
                    </pre>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Ações de Teste</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Notificação simulada",
                        description: "Esta seria uma notificação interna para o usuário."
                      });
                    }}
                  >
                    Simular Notificação
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = `${window.location.origin}/invite/test_${Date.now()}`;
                      navigator.clipboard.writeText(link);
                      toast({
                        title: "Link de teste copiado",
                        description: "Link simulado copiado para área de transferência."
                      });
                    }}
                  >
                    Gerar Link Teste
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="export">Exportar Dados</Label>
                  <div className="flex gap-2">
                    <Button onClick={handleExport} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar JSON
                    </Button>
                  </div>
                  {exportData && (
                    <Textarea
                      value={exportData}
                      readOnly
                      className="mt-2 h-32 text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="import">Importar Dados (Teste)</Label>
                  <Textarea
                    id="import"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Cole dados JSON aqui..."
                    className="h-32 text-xs"
                  />
                  <Button onClick={handleImport} className="w-full mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-destructive">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground">
                  Limpar todos os dados de convites (irreversível)
                </p>
              </div>
              <Button variant="destructive" onClick={clearAllData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Log de Atividades</h3>
              <Badge variant="outline">{activities.length} registros</Badge>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-sm font-medium">
                          {activity.performedByName}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.targetName} • {activity.recipientEmail}
                      </p>
                      {activity.message && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{activity.message}"
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                ))}
                
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade registrada</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}