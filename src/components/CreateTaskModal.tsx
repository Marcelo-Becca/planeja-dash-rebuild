import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2, Plus, X, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocalData } from "@/hooks/useLocalData";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProgressBar from "@/components/ProgressBar";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProjectId?: string;
  taskToEdit?: any;
  onTaskCreated?: () => void;
}

interface TaskFormData {
  title: string;
  shortDescription: string;
  description: string;
  projectId: string;
  assigneeIds: string[];
  teamIds: string[];
  priority: string;
  status: string;
  deadline?: Date;
  tags: string[];
  progress: number;
}

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: 'medium', label: 'Média', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: 'low', label: 'Baixa', color: 'text-blue-400', bg: 'bg-blue-500/10' }
];

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in-progress', label: 'Em andamento' },
  { value: 'under-review', label: 'Em revisão' },
  { value: 'completed', label: 'Concluída' }
];

const progressPresets = [0, 25, 50, 75, 100];

export default function CreateTaskModal({ 
  open, 
  onOpenChange, 
  preselectedProjectId,
  taskToEdit,
  onTaskCreated
}: CreateTaskModalProps) {
  const { projects, users, teams, addTask, updateTask } = useLocalData();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!taskToEdit;
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    shortDescription: '',
    description: '',
    projectId: preselectedProjectId || '',
    assigneeIds: [],
    teamIds: [],
    priority: 'medium',
    status: 'pending',
    deadline: undefined,
    tags: [],
    progress: 0
  });

  // Load task data when editing
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        shortDescription: taskToEdit.shortDescription || '',
        description: taskToEdit.description || '',
        projectId: taskToEdit.projectId || '',
        assigneeIds: taskToEdit.assigneeIds || [],
        teamIds: taskToEdit.teamIds || [],
        priority: taskToEdit.priority || 'medium',
        status: taskToEdit.status || 'pending',
        deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline) : undefined,
        tags: taskToEdit.tags || [],
        progress: taskToEdit.progress || 0
      });
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        projectId: preselectedProjectId || '',
        assigneeIds: [],
        teamIds: [],
        priority: 'medium',
        status: 'pending',
        deadline: undefined,
        tags: [],
        progress: 0
      });
    }
  }, [taskToEdit, preselectedProjectId, open]);

  // Auto-adjust status based on progress
  useEffect(() => {
    if (formData.progress > 0 && formData.progress < 100 && formData.status === 'pending') {
      setFormData(prev => ({ ...prev, status: 'in-progress' }));
    } else if (formData.progress === 100 && formData.status !== 'completed') {
      setFormData(prev => ({ ...prev, status: 'completed' }));
    }
  }, [formData.progress]);

  // Auto-adjust progress when status is completed
  useEffect(() => {
    if (formData.status === 'completed' && formData.progress !== 100) {
      setFormData(prev => ({ ...prev, progress: 100 }));
    }
  }, [formData.status]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Título muito longo (máx. 100 caracteres)';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Selecione um projeto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAndCreateAnother = false) => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de continuar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate local storage save
      await new Promise(resolve => setTimeout(resolve, 300));

      const assignedUsers = users.filter(u => formData.assigneeIds.includes(u.id));
      
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId,
        assigneeIds: formData.assigneeIds,
        teamIds: formData.teamIds,
        priority: formData.priority as any,
        status: formData.status as any,
        deadline: formData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        progress: formData.progress,
        tags: formData.tags,
        createdAt: taskToEdit?.createdAt || new Date(),
        createdBy: users[0],
        assignedTo: assignedUsers,
        comments: []
      };

      if (isEditMode) {
        updateTask(taskToEdit.id, taskData);
        toast({
          title: "Tarefa atualizada",
          description: `"${formData.title}" foi atualizada com sucesso.`
        });
      } else {
        addTask(taskData);
        toast({
          title: "Tarefa criada",
          description: `"${formData.title}" foi criada com sucesso.`
        });
      }

      onTaskCreated?.();

      // Reset form if creating another, otherwise close
      if (saveAndCreateAnother && !isEditMode) {
        setFormData({
          title: '',
          shortDescription: '',
          description: '',
          projectId: formData.projectId,
          assigneeIds: [],
          teamIds: [],
          priority: 'medium',
          status: 'pending',
          deadline: undefined,
          tags: [],
          progress: 0
        });
        setErrors({});
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar localmente — tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = formData.title || formData.description || formData.assigneeIds.length > 0;
    
    if (hasData && !isEditMode) {
      if (window.confirm('Deseja descartar as alterações?')) {
        onOpenChange(false);
        resetForm();
      }
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setTimeout(() => {
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        projectId: preselectedProjectId || '',
        assigneeIds: [],
        teamIds: [],
        priority: 'medium',
        status: 'pending',
        deadline: undefined,
        tags: [],
        progress: 0
      });
      setErrors({});
    }, 200);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  const toggleTeam = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }));
  };

  const getSelectedProject = () => projects.find(p => p.id === formData.projectId);
  const projectTeams = teams;
  const projectMembers = getSelectedProject()?.team || [];
  const hasMembers = projectMembers.length > 0;

  const canSubmit = formData.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            {isEditMode ? 'Editar Tarefa' : 'Criar Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Atualize os detalhes da tarefa abaixo'
              : 'Preencha os campos para criar uma nova tarefa'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Digite o título da tarefa"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Descrição Curta */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descrição Curta</Label>
              <Input
                id="shortDescription"
                placeholder="Uma linha resumindo a tarefa"
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground">
                {formData.shortDescription.length}/150 caracteres
              </p>
            </div>

            {/* Descrição Completa */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Completa</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da tarefa..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Projeto */}
            <div className="space-y-2">
              <Label htmlFor="project" className="flex items-center gap-2">
                Projeto <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, projectId: value, assigneeIds: [], teamIds: [] }));
                  if (errors.projectId) setErrors(prev => ({ ...prev, projectId: '' }));
                }}
              >
                <SelectTrigger className={cn(errors.projectId && "border-destructive")}>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.projectId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Responsáveis */}
            <div className="space-y-2">
              <Label>Responsáveis</Label>
              {!hasMembers ? (
                <div className="p-4 border border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhum membro no projeto
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Adicione membros na aba de equipe do projeto
                  </p>
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      {formData.assigneeIds.length > 0
                        ? `${formData.assigneeIds.length} selecionado(s)`
                        : "Selecionar responsáveis"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 pointer-events-auto">
                    <div className="space-y-2">
                      {projectMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={formData.assigneeIds.includes(member.id)}
                            onCheckedChange={() => toggleAssignee(member.id)}
                          />
                          <label
                            htmlFor={`member-${member.id}`}
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Equipes */}
            {projectTeams.length > 0 && (
              <div className="space-y-2">
                <Label>Equipes</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      {formData.teamIds.length > 0
                        ? `${formData.teamIds.length} equipe(s) selecionada(s)`
                        : "Selecionar equipes"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 pointer-events-auto">
                    <div className="space-y-2">
                      {projectTeams.map((team) => (
                        <div key={team.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`team-${team.id}`}
                            checked={formData.teamIds.includes(team.id)}
                            onCheckedChange={() => toggleTeam(team.id)}
                          />
                          <label
                            htmlFor={`team-${team.id}`}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {team.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Digite uma tag e pressione Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Progresso */}
            <div className="space-y-3">
              <Label>Progresso Inicial</Label>
              <div className="flex gap-2">
                {progressPresets.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={formData.progress === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, progress: preset }))}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
              <ProgressBar
                label="Progresso"
                current={formData.progress}
                total={100}
                variant="primary"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <div className="flex gap-2">
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={!canSubmit || isLoading}
              >
                Salvar e criar outra
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={!canSubmit || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
