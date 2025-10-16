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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, X, AlertCircle, Flag, User, CheckSquare, Save, Undo2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useLocalData } from "@/hooks/useLocalData";
import { useTeams } from "@/hooks/useTeams";
import { MultiTeamSelector } from "@/components/MultiTeamSelector";
interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProjectId?: string;
}
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}
interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  teamIds: string[];
  assigneeIds: string[];
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "under-review";
  dueDate: Date | undefined;
  subtasks: SubTask[];
}
const priorityOptions = [{
  value: "low",
  label: "Baixa",
  color: "bg-green-100 text-green-800 border-green-200"
}, {
  value: "medium",
  label: "Média",
  color: "bg-yellow-100 text-yellow-800 border-yellow-200"
}, {
  value: "high",
  label: "Alta",
  color: "bg-red-100 text-red-800 border-red-200"
}];
const statusOptions = [{
  value: "pending",
  label: "Pendente"
}, {
  value: "in-progress",
  label: "Em andamento"
}, {
  value: "under-review",
  label: "Em revisão"
}];
export default function CreateTaskModal({
  open,
  onOpenChange,
  preselectedProjectId
}: CreateTaskModalProps) {
  const { toast } = useToast();
  const { projects } = useProjects();
  const { createTask } = useTasks();
  const { users } = useLocalData();
  const { teams } = useTeams();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    projectId: preselectedProjectId || "",
    teamIds: [],
    assigneeIds: [],
    priority: "medium",
    status: "pending",
    dueDate: undefined,
    subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState("");
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Data de entrega é obrigatória";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (saveAndCreate = false) => {
    if (!validateForm()) {
      toast({
        title: "Erro na validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        project_id: formData.projectId === 'independent' ? null : formData.projectId,
        team_id: formData.teamIds.length > 0 ? formData.teamIds[0] : null,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.dueDate!,
        assignee_ids: formData.assigneeIds
      });

      if (saveAndCreate) {
        // Reset form for new task
        setFormData({
          title: "",
          description: "",
          projectId: formData.projectId, // Keep project selected
          teamIds: formData.teamIds, // Keep teams selected
          assigneeIds: [],
          priority: "medium",
          status: "pending",
          dueDate: undefined,
          subtasks: []
        });
        setErrors({});
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    const hasData = formData.title || formData.description || formData.assigneeIds.length > 0 || formData.teamIds.length > 0;
    if (hasData) {
      if (confirm("Tem certeza que deseja cancelar? Todas as informações serão perdidas.")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };
  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, {
          id: Date.now().toString(),
          title: newSubtask.trim(),
          completed: false
        }]
      }));
      setNewSubtask("");
    }
  };
  const removeSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id)
    }));
  };
  const toggleAssignee = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(memberId) ? prev.assigneeIds.filter(id => id !== memberId) : [...prev.assigneeIds, memberId]
    }));
  };
  const getSelectedProject = () => {
    return projects.find(p => p.id === formData.projectId);
  };
  const getSelectedMembers = () => {
    return users.filter(m => formData.assigneeIds.includes(m.id));
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Criar Nova Tarefa
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Defina os detalhes da sua atividade para organizar melhor o seu fluxo de trabalho
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              Título da tarefa
              <span className="text-red-500">*</span>
            </Label>
            <Input id="title" placeholder="Ex.: Implementar autenticação de login" value={formData.title} onChange={e => {
            setFormData(prev => ({
              ...prev,
              title: e.target.value
            }));
            if (errors.title) setErrors(prev => ({
              ...prev,
              title: ""
            }));
          }} className={cn(errors.title && "border-red-500 ring-red-500")} />
            {errors.title && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" placeholder="Descreva os detalhes da tarefa..." value={formData.description} onChange={e => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))} className="min-h-20" />
          </div>

          {/* Projeto */}
          <div className="space-y-2">
            <Label>Projeto associado</Label>
            <Select value={formData.projectId} onValueChange={value => setFormData(prev => ({
            ...prev,
            projectId: value
          }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Tarefa independente</SelectItem>
                {projects.map(project => <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {getSelectedProject() && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {getSelectedProject()?.name}
              </div>}
          </div>

          {/* Equipe */}
          <div className="space-y-2">
            <Label>Equipe responsável</Label>
            <MultiTeamSelector
              teams={teams.map(team => ({
                id: team.id,
                name: team.name,
                memberCount: team.members?.length || 0
              }))}
              selectedTeamIds={formData.teamIds}
              onSelectionChange={(teamIds) => {
                // Limit to 1 team selection
                const newTeamIds = teamIds.length > 1 ? [teamIds[teamIds.length - 1]] : teamIds;
                setFormData(prev => ({
                  ...prev,
                  teamIds: newTeamIds
                }));
              }}
              placeholder="Selecionar equipe..."
            />
          </div>

          {/* Responsáveis Individuais */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

            <div className="space-y-2">
              <Label>Responsáveis individuais</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    {formData.assigneeIds.length === 0 ? "Selecionar responsáveis" : `${formData.assigneeIds.length} selecionado(s)`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Membros da equipe</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {users.map(member => <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox id={member.id} checked={formData.assigneeIds.includes(member.id)} onCheckedChange={() => toggleAssignee(member.id)} />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.avatar}</AvatarFallback>
                          </Avatar>
                          <label htmlFor={member.id} className="text-sm cursor-pointer flex-1">
                            {member.name} - {member.role}
                          </label>
                        </div>)}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Selected members */}
              {getSelectedMembers().length > 0 && <div className="flex flex-wrap gap-2">
                  {getSelectedMembers().map(member => <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{member.name}</span>
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => toggleAssignee(member.id)} />
                    </Badge>)}
                </div>}
            </div>
          </div>

          {/* Prioridade e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prioridade */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Prioridade
              </Label>
              <div className="flex gap-2">
                {priorityOptions.map(option => <Button key={option.value} type="button" variant={formData.priority === option.value ? "default" : "outline"} size="sm" onClick={() => setFormData(prev => ({
                ...prev,
                priority: option.value as any
              }))} className={cn("flex-1", formData.priority === option.value && option.color)}>
                    {option.label}
                  </Button>)}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status inicial</Label>
              <Select value={formData.status} onValueChange={value => setFormData(prev => ({
              ...prev,
              status: value as any
            }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de entrega */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Data de entrega
              <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.dueDate && "text-muted-foreground", errors.dueDate && "border-red-500")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP", {
                  locale: ptBR
                }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.dueDate} onSelect={date => {
                setFormData(prev => ({
                  ...prev,
                  dueDate: date
                }));
                if (errors.dueDate) setErrors(prev => ({
                  ...prev,
                  dueDate: ""
                }));
              }} disabled={date => date < new Date()} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {errors.dueDate && <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.dueDate}
              </p>}
          </div>

          {/* Subtarefas */}
          

        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button onClick={handleCancel} variant="outline" className="sm:order-1">
            Cancelar
          </Button>
          
          <Button onClick={() => handleSubmit(true)} variant="outline" disabled={isLoading} className="sm:order-2">
            <Plus className="h-4 w-4 mr-2" />
            Salvar e criar outra
          </Button>

          <Button onClick={() => handleSubmit(false)} disabled={isLoading} className="sm:order-3">
            {isLoading ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </> : <>
                <Save className="h-4 w-4 mr-2" />
                Salvar tarefa
              </>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}