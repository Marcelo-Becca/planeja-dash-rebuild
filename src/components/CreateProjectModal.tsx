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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { Project, Team, User } from "@/data/mockData";

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
  priority: "low" | "medium" | "high";
  status: "active" | "on-hold";
  tags: string[];
  memberIds: string[];
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
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800 border-red-200" }
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
  const { users, teams, addProject, addTeam } = useLocalData();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState("project");
  const [showHelp, setShowHelp] = useState(false);
  const [createTeamMode, setCreateTeamMode] = useState<"existing" | "new">("new");
  const [existingTeamId, setExistingTeamId] = useState("");
  const [autoLinkTeam, setAutoLinkTeam] = useState(true);
  const [recentlyCreated, setRecentlyCreated] = useState<{project?: Project, team?: Team}>({});

  const [projectData, setProjectData] = useState<ProjectFormData>({
    name: "",
    description: "",
    startDate: new Date(),
    deadline: undefined,
    leaderId: "",
    category: "",
    priority: "medium",
    status: "active",
    tags: [],
    memberIds: []
  });

  const [teamData, setTeamData] = useState<TeamFormData>({
    name: "",
    description: "",
    leaderId: "",
    memberIds: [],
    color: teamColors[0],
    objective: ""
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
      status: "active",
      tags: [],
      memberIds: []
    });
    setTeamData({
      name: "",
      description: "",
      leaderId: "",
      memberIds: [],
      color: teamColors[0],
      objective: ""
    });
    setNewTag("");
    setErrors({});
    setCreateTeamMode("new");
    setExistingTeamId("");
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

    if (!projectData.deadline) {
      newErrors.projectDeadline = "Prazo final é obrigatório";
    } else if (projectData.startDate && projectData.deadline <= projectData.startDate) {
      newErrors.projectDeadline = "Prazo deve ser posterior à data de início";
    }

    if (!projectData.leaderId) {
      newErrors.projectLeader = "Líder do projeto é obrigatório";
    }

    // Check if leader is in team members
    if (projectData.leaderId && !projectData.memberIds.includes(projectData.leaderId)) {
      newErrors.projectLeader = "O líder deve estar incluído nos membros da equipe";
    }

    return newErrors;
  };

  const validateTeam = () => {
    const newErrors: Record<string, string> = {};
    
    if (createTeamMode === "new") {
      if (!teamData.name.trim()) {
        newErrors.teamName = "Nome da equipe é obrigatório";
      }
      
      if (!teamData.leaderId) {
        newErrors.teamLeader = "Líder da equipe é obrigatório";
      }

      if (teamData.memberIds.length === 0) {
        newErrors.teamMembers = "Equipe deve ter pelo menos um membro";
      }

      // Check if leader is in team members
      if (teamData.leaderId && !teamData.memberIds.includes(teamData.leaderId)) {
        newErrors.teamLeader = "O líder deve estar incluído nos membros da equipe";
      }
    } else if (createTeamMode === "existing" && !existingTeamId) {
      newErrors.existingTeam = "Selecione uma equipe existente";
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      let newTeam: Team | undefined;
      let teamToUse: Team | undefined;

      // Create or get team
      if (createTeamMode === "new") {
        const teamLeader = users.find(u => u.id === teamData.leaderId)!;
        const teamMembers = users.filter(u => teamData.memberIds.includes(u.id));

        newTeam = addTeam({
          name: teamData.name,
          description: teamData.description,
          objective: teamData.objective,
          status: "active",
          color: teamData.color,
          createdAt: new Date(),
          createdBy: teamLeader,
          leader: teamLeader,
          members: teamMembers.map(member => ({
            id: `member-${member.id}`,
            user: member,
            role: member.id === teamData.leaderId ? "leader" : "member",
            joinedAt: new Date(),
            tasksCount: 0
          })),
          projects: [],
        recentActivity: [{
          id: `activity-${Date.now()}`,
          type: "member_added",
          description: `Equipe ${teamData.name} foi criada`,
          performedBy: teamLeader,
          timestamp: new Date()
        }]
        });
        teamToUse = newTeam;
      } else {
        teamToUse = teams.find(t => t.id === existingTeamId);
      }

      // Create project
      const projectLeader = users.find(u => u.id === projectData.leaderId)!;
      const projectMembers = teamToUse ? teamToUse.members.map(m => m.user) : users.filter(u => projectData.memberIds.includes(u.id));

      const newProject = addProject({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        deadline: projectData.deadline!,
        createdBy: projectLeader,
        team: projectMembers,
        progress: 0,
        tasksCount: 0,
        completedTasks: 0
      });

      setRecentlyCreated({ project: newProject, team: newTeam });

      toast({
        title: "Sucesso!",
        description: `Projeto "${newProject.name}" ${newTeam ? 'e equipe criados' : 'criado'} com sucesso!`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate undo
              toast({
                title: "Ação desfeita",
                description: "Criação cancelada (simulação)",
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
        title: "Erro ao criar projeto",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasProjectData = projectData.name || projectData.description;
    const hasTeamData = createTeamMode === "new" && (teamData.name || teamData.description);
    
    if (hasProjectData || hasTeamData) {
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

  const toggleProjectMember = (userId: string) => {
    setProjectData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  const toggleTeamMember = (userId: string) => {
    setTeamData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  const handleTeamModeChange = (mode: "existing" | "new") => {
    setCreateTeamMode(mode);
    if (mode === "existing") {
      // Clear team form data when switching to existing
      setTeamData({
        name: "",
        description: "",
        leaderId: "",
        memberIds: [],
        color: teamColors[0],
        objective: ""
      });
    }
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
                Configure seu projeto e, opcionalmente, crie ou associe uma equipe
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
              <li>• Opcionalmente, crie uma nova equipe ou associe uma existente</li>
              <li>• O líder do projeto deve estar incluído na equipe</li>
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
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="on-hold">Em Pausa</SelectItem>
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
                      leaderId: value,
                      memberIds: prev.memberIds.includes(value) ? prev.memberIds : [...prev.memberIds, value]
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

              {/* Project Members */}
              <div className="space-y-2">
                <Label>Membros do Projeto</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${user.id}`}
                        checked={projectData.memberIds.includes(user.id)}
                        onCheckedChange={() => toggleProjectMember(user.id)}
                        disabled={user.id === projectData.leaderId}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <label htmlFor={`project-${user.id}`} className="text-sm cursor-pointer flex-1">
                        {user.name} - {user.role}
                        {user.id === projectData.leaderId && (
                          <Badge variant="outline" className="ml-2 text-xs">Líder</Badge>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Configuração da Equipe</h3>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoLinkTeam}
                    onCheckedChange={setAutoLinkTeam}
                  />
                  <Label className="text-sm text-muted-foreground">
                    Vincular automaticamente ao projeto
                  </Label>
                </div>
              </div>

              {/* Team Mode Selection */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <Button
                  type="button"
                  variant={createTeamMode === "new" ? "default" : "outline"}
                  onClick={() => handleTeamModeChange("new")}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Nova Equipe
                </Button>
                <Button
                  type="button"
                  variant={createTeamMode === "existing" ? "default" : "outline"}
                  onClick={() => handleTeamModeChange("existing")}
                  className="flex-1"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Usar Equipe Existente
                </Button>
              </div>

              {createTeamMode === "existing" ? (
                /* Existing Team Selection */
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Selecionar Equipe
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={existingTeamId}
                    onValueChange={(value) => {
                      setExistingTeamId(value);
                      if (errors.existingTeam) setErrors(prev => ({ ...prev, existingTeam: "" }));
                    }}
                  >
                    <SelectTrigger className={cn(errors.existingTeam && "border-red-500")}>
                      <SelectValue placeholder="Selecione uma equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: team.color }}
                            />
                            {team.name} ({team.members.length} membros)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.existingTeam && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.existingTeam}
                    </p>
                  )}

                  {/* Show selected team info */}
                  {existingTeamId && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      {(() => {
                        const selectedTeam = teams.find(t => t.id === existingTeamId);
                        return selectedTeam ? (
                          <div>
                            <h4 className="font-medium">{selectedTeam.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedTeam.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                Líder: {selectedTeam.leader.name}
                              </Badge>
                              <Badge variant="outline">
                                {selectedTeam.members.length} membros
                              </Badge>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                /* New Team Form */
                <div className="space-y-4">
                  {/* Team Name & Color */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="teamName" className="flex items-center gap-2">
                        Nome da Equipe
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="teamName"
                        placeholder="Ex.: Time de Desenvolvimento"
                        value={teamData.name}
                        onChange={(e) => {
                          setTeamData(prev => ({ ...prev, name: e.target.value }));
                          if (errors.teamName) setErrors(prev => ({ ...prev, teamName: "" }));
                        }}
                        className={cn(errors.teamName && "border-red-500")}
                      />
                      {errors.teamName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.teamName}
                        </p>
                      )}
                    </div>

                    {/* Team Color */}
                    <div className="space-y-2">
                      <Label>Cor da Equipe</Label>
                      <div className="flex flex-wrap gap-2">
                        {teamColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setTeamData(prev => ({ ...prev, color }))}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              teamData.color === color ? "border-primary scale-110" : "border-border"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Team Description */}
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Descrição</Label>
                    <Textarea
                      id="teamDescription"
                      placeholder="Descreva o propósito desta equipe..."
                      value={teamData.description}
                      onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-16"
                    />
                  </div>

                  {/* Team Objective */}
                  <div className="space-y-2">
                    <Label htmlFor="teamObjective" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Objetivo Principal
                    </Label>
                    <Input
                      id="teamObjective"
                      placeholder="Ex.: Desenvolver e manter produtos digitais"
                      value={teamData.objective}
                      onChange={(e) => setTeamData(prev => ({ ...prev, objective: e.target.value }))}
                    />
                  </div>

                  {/* Team Leader */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Líder da Equipe
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={teamData.leaderId}
                      onValueChange={(value) => {
                        setTeamData(prev => ({ 
                          ...prev, 
                          leaderId: value,
                          memberIds: prev.memberIds.includes(value) ? prev.memberIds : [...prev.memberIds, value]
                        }));
                        if (errors.teamLeader) setErrors(prev => ({ ...prev, teamLeader: "" }));
                      }}
                    >
                      <SelectTrigger className={cn(errors.teamLeader && "border-red-500")}>
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
                    {errors.teamLeader && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.teamLeader}
                      </p>
                    )}
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Membros da Equipe
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`team-${user.id}`}
                            checked={teamData.memberIds.includes(user.id)}
                            onCheckedChange={() => toggleTeamMember(user.id)}
                            disabled={user.id === teamData.leaderId}
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{user.avatar}</AvatarFallback>
                          </Avatar>
                          <label htmlFor={`team-${user.id}`} className="text-sm cursor-pointer flex-1">
                            {user.name} - {user.role}
                            {user.id === teamData.leaderId && (
                              <Badge variant="outline" className="ml-2 text-xs">Líder</Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.teamMembers && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.teamMembers}
                      </p>
                    )}
                  </div>
                </div>
              )}
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