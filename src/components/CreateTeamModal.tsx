import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocalData } from "@/hooks/useLocalData";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  AlertCircle,
  Users,
  Target,
  CheckCircle2,
  Loader2,
  Undo2,
  Palette,
  HelpCircle
} from "lucide-react";
import { Team } from "@/data/mockData";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeamFormData {
  name: string;
  description: string;
  objective: string;
  leaderId: string;
  memberIds: string[];
  color: string;
}

const teamColors = [
  { value: "#3B82F6", name: "Azul" },
  { value: "#EF4444", name: "Vermelho" },
  { value: "#10B981", name: "Verde" },
  { value: "#F59E0B", name: "Amarelo" },
  { value: "#8B5CF6", name: "Roxo" },
  { value: "#EC4899", name: "Rosa" },
  { value: "#06B6D4", name: "Ciano" },
  { value: "#84CC16", name: "Lima" },
  { value: "#F97316", name: "Laranja" },
  { value: "#6B7280", name: "Cinza" }
];

const objectiveSuggestions = [
  "Desenvolver produtos digitais",
  "Gerenciar marketing e vendas",
  "Garantir qualidade e testes",
  "Fornecer suporte ao cliente",
  "Pesquisar e inovar",
  "Gerenciar recursos humanos",
  "Administrar operações",
  "Cuidar da infraestrutura"
];

export default function CreateTeamModal({ open, onOpenChange }: CreateTeamModalProps) {
  const { toast } = useToast();
  const { users, teams, addTeam } = useLocalData();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);
  const [recentlyCreated, setRecentlyCreated] = useState<Team | null>(null);

  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "", 
    objective: "",
    leaderId: "",
    memberIds: [],
    color: teamColors[0].value
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      objective: "",
      leaderId: "",
      memberIds: [],
      color: teamColors[0].value
    });
    setErrors({});
    setRecentlyCreated(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome da equipe é obrigatório";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    // Check for duplicate team name
    const duplicateName = teams.find(team => 
      team.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (duplicateName) {
      newErrors.name = "Já existe uma equipe com este nome";
    }
    
    if (!formData.leaderId) {
      newErrors.leaderId = "Líder da equipe é obrigatório";
    }

    if (formData.memberIds.length === 0) {
      newErrors.members = "Equipe deve ter pelo menos um membro";
    }

    // Check if leader is in team members
    if (formData.leaderId && !formData.memberIds.includes(formData.leaderId)) {
      newErrors.leaderId = "O líder deve estar incluído nos membros da equipe";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Erro na validação",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const teamLeader = users.find(u => u.id === formData.leaderId)!;
      const teamMembers = users.filter(u => formData.memberIds.includes(u.id));

      const newTeam = addTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
        objective: formData.objective.trim(),
        status: "active",
        color: formData.color,
        createdAt: new Date(),
        createdBy: teamLeader,
        leader: teamLeader,
        members: teamMembers.map(member => ({
          id: `member-${member.id}`,
          user: member,
          role: member.id === formData.leaderId ? "leader" : "member",
          joinedAt: new Date(),
          tasksCount: 0
        })),
        projects: [],
        recentActivity: [{
          id: `activity-${Date.now()}`,
          type: "member_added",
          description: `Equipe ${formData.name} foi criada`,
          performedBy: teamLeader,
          timestamp: new Date()
        }]
      });

      setRecentlyCreated(newTeam);

      toast({
        title: "Equipe criada com sucesso!",
        description: `A equipe "${newTeam.name}" foi criada com ${teamMembers.length} membros.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate undo
              toast({
                title: "Ação desfeita",
                description: "Criação da equipe cancelada (simulação)",
              });
            }}
            className="gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Desfazer
          </Button>
        ),
      });

      // Show success for a moment then close
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro ao criar equipe",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = formData.name || formData.description || formData.memberIds.length > 0;
    
    if (hasData) {
      if (confirm("Tem certeza que deseja cancelar? Todas as informações serão perdidas.")) {
        onOpenChange(false);
        resetForm();
      }
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  const toggleMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  const handleLeaderChange = (leaderId: string) => {
    setFormData(prev => ({
      ...prev,
      leaderId,
      memberIds: prev.memberIds.includes(leaderId) ? prev.memberIds : [...prev.memberIds, leaderId]
    }));
    if (errors.leaderId) setErrors(prev => ({ ...prev, leaderId: "" }));
  };

  const addAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      memberIds: users.map(u => u.id)
    }));
  };

  const clearAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.leaderId ? [prev.leaderId] : []
    }));
  };

  const getSelectedMembers = () => {
    return users.filter(u => formData.memberIds.includes(u.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Criar Nova Equipe
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure uma equipe para colaboração e gerenciamento de projetos
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Ajuda
            </Button>
          </div>
        </DialogHeader>

        {/* Help Section */}
        {showHelp && (
          <div className="bg-muted/50 p-4 rounded-lg border mb-4">
            <h4 className="font-medium mb-2">Dicas para criar uma equipe:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Escolha um nome descritivo que identifique facilmente a equipe</li>
              <li>• Defina um objetivo claro para orientar o trabalho da equipe</li>
              <li>• O líder será responsável por coordenar e tomar decisões</li>
              <li>• Cores ajudam a identificar visualmente a equipe nos projetos</li>
              <li>• Você pode editar membros e informações após criar a equipe</li>
            </ul>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Team Name */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="teamName" className="flex items-center gap-2">
                  Nome da Equipe
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="teamName"
                  placeholder="Ex.: Time de Desenvolvimento"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  className={cn(errors.name && "border-red-500")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Team Color */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Cor da Equipe
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {teamColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                        formData.color === color.value ? "border-primary scale-110 shadow-lg" : "border-border"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cor selecionada: {teamColors.find(c => c.value === formData.color)?.name}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito e responsabilidades desta equipe..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-16"
              />
            </div>

            {/* Objective */}
            <div className="space-y-2">
              <Label htmlFor="objective" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objetivo Principal
              </Label>
              <div className="space-y-2">
                <Input
                  id="objective"
                  placeholder="Ex.: Desenvolver e manter produtos digitais"
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                />
                
                {/* Objective suggestions */}
                <div className="flex flex-wrap gap-1">
                  {objectiveSuggestions.slice(0, 4).map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, objective: suggestion }))}
                      className="h-6 px-2 text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Structure */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estrutura da Equipe</h3>

            {/* Team Leader */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Líder da Equipe
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.leaderId}
                onValueChange={handleLeaderChange}
              >
                <SelectTrigger className={cn(errors.leaderId && "border-red-500")}>
                  <SelectValue placeholder="Selecione o líder da equipe" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <span className="text-muted-foreground text-sm ml-2">{user.role}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaderId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.leaderId}
                </p>
              )}
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Membros da Equipe
                  <span className="text-red-500">*</span>
                  <Badge variant="outline" className="ml-2">
                    {formData.memberIds.length} selecionados
                  </Badge>
                </Label>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllMembers}
                    className="text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllMembers}
                    className="text-xs"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50">
                    <Checkbox
                      id={`member-${user.id}`}
                      checked={formData.memberIds.includes(user.id)}
                      onCheckedChange={() => toggleMember(user.id)}
                      disabled={user.id === formData.leaderId}
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user.avatar}</AvatarFallback>
                    </Avatar>
                    <label htmlFor={`member-${user.id}`} className="text-sm cursor-pointer flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </label>
                    {user.id === formData.leaderId && (
                      <Badge variant="outline" className="text-xs">Líder</Badge>
                    )}
                  </div>
                ))}
              </div>
              {errors.members && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.members}
                </p>
              )}
            </div>

            {/* Selected Members Preview */}
            {getSelectedMembers().length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Membros selecionados:</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedMembers().map((member) => (
                    <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{member.name}</span>
                      {member.id === formData.leaderId && (
                        <span className="text-xs font-medium">(Líder)</span>
                      )}
                      {member.id !== formData.leaderId && (
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => toggleMember(member.id)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Modo demonstrativo: dados salvos localmente
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando Equipe...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Criar Equipe
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}