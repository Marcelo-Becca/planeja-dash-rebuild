import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocalData } from "@/hooks/useLocalData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  AlertCircle,
  Users,
  FolderPlus,
  Building2,
  Target,
  Tag,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Undo2
} from "lucide-react";
import { MultiTeamSelector } from "./MultiTeamSelector";
import { useTeams } from "@/hooks/useTeams";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: Date | undefined;
  deadline: Date | undefined;
  leaderId: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "active" | "on-hold" | "planning" | "completed";
  tags: string[];
}

interface TeamFormData {
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  color: string;
  objective: string;
}

const priorityOptions = [
  { value: "low", label: "Baixa", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "urgent", label: "Urgente", color: "bg-purple-100 text-purple-800 border-purple-200" }
];

const statusOptions = [
  { value: "planning", label: "Planejamento" },
  { value: "active", label: "Ativo" },
  { value: "on-hold", label: "Pausado" },
  { value: "completed", label: "Concluído" }
];

const categoryOptions = [
  "Desenvolvimento",
  "Design",
  "Marketing", 
  "Vendas",
  "Operações",
  "Pesquisa",
  "Outro"
];

const teamColors = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
];

const tagSuggestions = [
  "Frontend", "Backend", "Mobile", "Web", "API", "Database",
  "Marketing", "SEO", "Social Media", "Email", "Content",
  "UI/UX", "Branding", "Research", "Testing", "Analytics"
];

export default function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { toast } = useToast();
  const { users } = useLocalData();
  const { teams } = useTeams();
  const { createProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState("project");
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const [projectData, setProjectData] = useState<ProjectFormData>({
    name: "",
    description: "",
    startDate: new Date(),
    deadline: undefined,
    leaderId: "",
    category: "",
    priority: "medium",
    status: "planning",
    tags: []
  });

  const [newTag, setNewTag] = useState("");

  const resetForm = () => {
    setProjectData({
      name: "",
      description: "",
      startDate: new Date(),
      deadline: undefined,
      leaderId: "",
      category: "",
      priority: "medium",
      status: "planning",
      tags: []
    });
    setNewTag("");
    setErrors({});
    setSelectedTeamIds([]);
    setCurrentTab("project");
  };

  const validateProject = () => {
    const newErrors: Record<string, string> = {};
    
    if (!projectData.name.trim()) {
      newErrors.projectName = "Nome do projeto é obrigatório";
    } else if (projectData.name.trim().length < 3) {
      newErrors.projectName = "Nome deve ter pelo menos 3 caracteres";
    }
    
    if (!projectData.description.trim()) {
      newErrors.projectDescription = "Descrição é obrigatória";
    }

    if (!projectData.category) {
      newErrors.projectCategory = "Categoria é obrigatória";
    }

    if (!projectData.startDate) {
      newErrors.projectStartDate = "Data de início é obrigatória";
    }

    if (!projectData.deadline) {
      newErrors.projectDeadline = "Prazo final é obrigatório";
    } else if (projectData.startDate && projectData.deadline <= projectData.startDate) {
      newErrors.projectDeadline = "Prazo deve ser posterior à data de início";
    }

    if (!projectData.leaderId) {
      newErrors.projectLeader = "Líder do projeto é obrigatório";
    }

    return newErrors;
  };

  const validateTeam = () => {
    const newErrors: Record<string, string> = {};
    
    if (selectedTeamIds.length === 0) {
      newErrors.existingTeam = "Selecione pelo menos uma equipe";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const projectErrors = validateProject();
    const teamErrors = validateTeam();
    const allErrors = { ...projectErrors, ...teamErrors };

    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      toast({
        title: "Erro na validação",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      await createProject({
        name: projectData.name,
        category: projectData.category,
        description: projectData.description,
        start_date: projectData.startDate!,
        end_date: projectData.deadline!,
        priority: projectData.priority,
        status: projectData.status,
        tags: projectData.tags.length > 0 ? projectData.tags : undefined,
        leader_id: projectData.leaderId,
        team_ids: selectedTeamIds,
      });

      onOpenChange(false);
      resetForm();

    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasProjectData = projectData.name || projectData.description;
    
    if (hasProjectData) {
      if (confirm("Tem certeza que deseja cancelar? Todas as informações serão perdidas.")) {
        onOpenChange(false);
        resetForm();
      }
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !projectData.tags.includes(newTag.trim())) {
      setProjectData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setProjectData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Criar Novo Projeto
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure seu projeto e associe uma equipe existente
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Como funciona
            </Button>
          </div>
        </DialogHeader>

        {/* Help Section */}
        {showHelp && (
          <div className="bg-muted/50 p-4 rounded-lg border mb-4">
            <h4 className="font-medium mb-2">Como criar um projeto:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Preencha as informações básicas do projeto na primeira aba</li>
              <li>• Selecione o líder do projeto</li>
              <li>• Associe uma equipe existente na segunda aba</li>
              <li>• Você pode adicionar tags para facilitar buscas e filtros</li>
              <li>• Após criar, você pode adicionar tarefas e acompanhar o progresso</li>
            </ul>
          </div>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project" className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Projeto
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="space-y-6 mt-6">
            {/* Project Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="flex items-center gap-2">
                    Nome do Projeto
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="Ex.: Sistema de Gestão"
                    value={projectData.name}
                    onChange={(e) => {
                      setProjectData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.projectName) setErrors(prev => ({ ...prev, projectName: "" }));
                    }}
                    className={cn(errors.projectName && "border-red-500")}
                  />
                  {errors.projectName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.projectName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={projectData.category}
                    onValueChange={(value) => setProjectData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="flex items-center gap-2">
                  Descrição
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Descreva o objetivo e escopo do projeto..."
                  value={projectData.description}
                  onChange={(e) => {
                    setProjectData(prev => ({ ...prev, description: e.target.value }));
                    if (errors.projectDescription) setErrors(prev => ({ ...prev, projectDescription: "" }));
                  }}
                  className={cn("min-h-20", errors.projectDescription && "border-red-500")}
                />
                {errors.projectDescription && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.projectDescription}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {projectData.startDate ? (
                          format(projectData.startDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={projectData.startDate}
                        onSelect={(date) => setProjectData(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Prazo Final
                    <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !projectData.deadline && "text-muted-foreground",
                          errors.projectDeadline && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {projectData.deadline ? (
                          format(projectData.deadline, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={projectData.deadline}
                        onSelect={(date) => {
                          setProjectData(prev => ({ ...prev, deadline: date }));
                          if (errors.projectDeadline) setErrors(prev => ({ ...prev, projectDeadline: "" }));
                        }}
                        disabled={(date) => projectData.startDate ? date <= projectData.startDate : date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.projectDeadline && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.projectDeadline}
                    </p>
                  )}
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <div className="flex gap-2">
                    {priorityOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={projectData.priority === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProjectData(prev => ({ ...prev, priority: option.value as any }))}
                        className="flex-1"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status Inicial</Label>
                  <Select
                    value={projectData.status}
                    onValueChange={(value) => setProjectData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags (opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Tag suggestions */}
                <div className="flex flex-wrap gap-1">
                  {tagSuggestions.slice(0, 6).map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!projectData.tags.includes(suggestion)) {
                          setProjectData(prev => ({ ...prev, tags: [...prev.tags, suggestion] }));
                        }
                      }}
                      className="h-6 px-2 text-xs"
                      disabled={projectData.tags.includes(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                {/* Selected tags */}
                {projectData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {projectData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Leader */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Líder do Projeto
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={projectData.leaderId}
                  onValueChange={(value) => {
                    setProjectData(prev => ({ 
                      ...prev, 
                      leaderId: value
                    }));
                    if (errors.projectLeader) setErrors(prev => ({ ...prev, projectLeader: "" }));
                  }}
                >
                  <SelectTrigger className={cn(errors.projectLeader && "border-red-500")}>
                    <SelectValue placeholder="Selecione o líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{user.avatar}</AvatarFallback>
                          </Avatar>
                          {user.name} - {user.role}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectLeader && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.projectLeader}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Selecionar Equipes</h3>

              {/* Multiple Team Selection */}
              <div className="space-y-2">
                <MultiTeamSelector
                  teams={teams.map(t => ({ 
                    id: t.id, 
                    name: t.name,
                    color: '#3B82F6',
                    memberCount: t.members?.length || 0
                  }))}
                  selectedTeamIds={selectedTeamIds}
                  onSelectionChange={(teamIds) => {
                    setSelectedTeamIds(teamIds);
                    if (errors.existingTeam) setErrors(prev => ({ ...prev, existingTeam: "" }));
                  }}
                  placeholder="Selecione aqui suas equipes"
                />
                {errors.existingTeam && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.existingTeam}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
                  Criando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Criar Projeto
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}