import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Users, LogIn } from "lucide-react";

export default function TestUserSwitcher() {
  const { testUsers, switchToTestUser, user } = useAuth();
  const [open, setOpen] = useState(false);

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'estagiario': return 'bg-yellow-100 text-yellow-700';
      case 'junior': return 'bg-green-100 text-green-700';
      case 'pleno': return 'bg-blue-100 text-blue-700';
      case 'senior': return 'bg-purple-100 text-purple-700';
      case 'lead': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeniorityLabel = (seniority: string) => {
    switch (seniority) {
      case 'estagiario': return 'Estagiário';
      case 'junior': return 'Júnior';
      case 'pleno': return 'Pleno';
      case 'senior': return 'Sênior';
      case 'lead': return 'Lead';
      default: return seniority;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Trocar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usuários de Teste</DialogTitle>
          <DialogDescription>
            Selecione um usuário para simular o login e testar diferentes perspectivas da aplicação.
            <br />
            <strong>Usuário atual:</strong> {user?.name} ({user?.role})
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testUsers.map((testUser) => (
            <Card 
              key={testUser.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                user?.id === testUser.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                switchToTestUser(testUser);
                setOpen(false);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                    {testUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">
                      {testUser.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {testUser.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex gap-1 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeniorityColor(testUser.seniority)}`}
                    >
                      {getSeniorityLabel(testUser.seniority)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {testUser.department}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {testUser.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {testUser.email}
                    </span>
                    {user?.id === testUser.id ? (
                      <Badge variant="default" className="text-xs">
                        Ativo
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          switchToTestUser(testUser);
                          setOpen(false);
                        }}
                      >
                        <LogIn className="w-3 h-3 mr-1" />
                        Usar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Use a senha <code className="bg-background px-1 rounded">Test123!</code> para fazer login com qualquer usuário de teste, 
            ou clique diretamente em "Usar" para alternar instantaneamente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}