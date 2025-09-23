import { useState, useEffect } from 'react';
import { Calendar, Copy, Link, Mail, Users, X, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ContactSelector } from './ContactSelector';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';
import { 
  InvitationFormData, 
  InvitationRole, 
  InvitationTarget, 
  CircleContact,
  ROLE_DESCRIPTIONS,
  EXPIRATION_OPTIONS
} from '@/types/invitation';
import { User, Team, mockProjects, mockTeams } from '@/data/mockData';

interface InvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: InvitationTarget;
  currentUser: User;
  availableTeams?: Team[];
  currentUserRole?: InvitationRole;
}

export function InvitationModal({
  open,
  onOpenChange,
  target,
  currentUser,
  availableTeams = [],
  currentUserRole = 'admin'
}: InvitationModalProps) {
  const { sendInvitation, isLoading } = useInvitations();
  const { toast } = useToast();

  const [formData, setFormData] = useState<InvitationFormData>({
    recipientEmail: '',
    recipientName: '',
    role: 'member',
    teams: [],
    message: '',
    expirationDays: 7,
    generateLink: false,
    sendNotification: true
  });

  const [selectedContact, setSelectedContact] = useState<CircleContact | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [projectSearchOpen, setProjectSearchOpen] = useState(false);
  const [projectSearchValue, setProjectSearchValue] = useState('');

  // Get all projects and teams for the dropdown
  const allProjectsAndTeams = [
    ...mockProjects.map(project => ({
      id: project.id,
      name: project.name,
      type: 'project' as const,
      description: project.description
    })),
    ...mockTeams.map(team => ({
      id: team.id,
      name: team.name,
      type: 'team' as const,
      description: team.description
    }))
  ];

  // Filter projects and teams based on search
  const filteredProjectsAndTeams = allProjectsAndTeams.filter(item =>
    item.name.toLowerCase().includes(projectSearchValue.toLowerCase())
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        recipientEmail: '',
        recipientName: '',
        role: 'member',
        teams: [],
        message: '',
        expirationDays: 7,
        generateLink: false,
        sendNotification: true
      });
      setSelectedContact(null);
      setEmailError('');
      setProjectSearchOpen(false);
      setProjectSearchValue('');
    }
  }, [open]);

  // Update email and name when contact is selected
  useEffect(() => {
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        recipientEmail: selectedContact.email,
        recipientName: selectedContact.name,
        recipientId: selectedContact.id
      }));
      setEmailError('');
    } else {
      setFormData(prev => ({
        ...prev,
        recipientId: undefined
      }));
    }
  }, [selectedContact]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!email) {
      setEmailError('E-mail é obrigatório');
      return false;
    }
    
    if (!isValid) {
      setEmailError('E-mail inválido');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  // Handle email input change
  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, recipientEmail: email }));
    if (email !== selectedContact?.email) {
      setSelectedContact(null);
    }
    validateEmail(email);
  };

  // Check if user can assign role
  const canAssignRole = (role: InvitationRole): boolean => {
    const roleHierarchy: Record<InvitationRole, number> = {
      observer: 1,
      member: 2,
      admin: 3,
      owner: 4
    };

    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetRoleLevel = roleHierarchy[role] || 0;

    return targetRoleLevel <= currentUserLevel;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateEmail(formData.recipientEmail)) {
      return;
    }

    if (!formData.role) {
      toast({
        title: "Erro de validação",
        description: "Selecione um papel para o convidado.",
        variant: "destructive"
      });
      return;
    }

    const result = await sendInvitation(formData, target, currentUser);
    
    if (result.success) {
      onOpenChange(false);
      
      // If link was generated, show copy option
      if (formData.generateLink && result.invitation?.link) {
        const link = `${window.location.origin}/invite/${result.invitation.link}`;
        navigator.clipboard.writeText(link);
        
        toast({
          title: "Link copiado",
          description: `Link de convite copiado. Válido por ${formData.expirationDays} dias neste navegador.`
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Convidar membro
          </DialogTitle>
          <DialogDescription>
            Convide alguém para participar de "{target.name}" como colaborador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ex.: João da Silva"
              value={formData.recipientName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do convidado *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={formData.recipientEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={emailError ? 'border-destructive' : ''}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          {/* Contact Selection */}
          <div className="space-y-2">
            <Label htmlFor="contact-select">Ou escolher do círculo</Label>
            <ContactSelector
              onSelect={setSelectedContact}
              selectedContact={selectedContact}
              placeholder="Buscar no círculo de contatos..."
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Função ou cargo</Label>
            <Select
              value={formData.role}
              onValueChange={(value: InvitationRole) => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex flex-col">
                    <span className="font-medium">Membro</span>
                    <span className="text-xs text-muted-foreground">Pode participar e colaborar</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Gerente</span>
                    <span className="text-xs text-muted-foreground">Pode gerenciar membros e projetos</span>
                  </div>
                </SelectItem>
                <SelectItem value="observer">
                  <div className="flex flex-col">
                    <span className="font-medium">Colaborador</span>
                    <span className="text-xs text-muted-foreground">Apenas visualização</span>
                  </div>
                </SelectItem>
                {canAssignRole('owner') && (
                  <SelectItem value="owner">
                    <div className="flex flex-col">
                      <span className="font-medium">Proprietário</span>
                      <span className="text-xs text-muted-foreground">Controle total</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Project/Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Projeto/Equipe associada</Label>
            {allProjectsAndTeams.length === 0 ? (
              <div className="border border-input rounded-md p-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Nenhum projeto ou equipe encontrado
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </Button>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Equipe
                  </Button>
                </div>
              </div>
            ) : (
              <Popover open={projectSearchOpen} onOpenChange={setProjectSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={projectSearchOpen}
                    className="w-full justify-between"
                  >
                    {formData.projectId
                      ? allProjectsAndTeams.find(item => item.id === formData.projectId)?.name
                      : "Selecione um projeto ou equipe"
                    }
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover border border-border shadow-md z-50">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar projeto ou equipe..." 
                      value={projectSearchValue}
                      onValueChange={setProjectSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum projeto ou equipe encontrado.</CommandEmpty>
                      <CommandGroup heading="Projetos">
                        {filteredProjectsAndTeams
                          .filter(item => item.type === 'project')
                          .map((project) => (
                            <CommandItem
                              key={project.id}
                              value={project.id}
                              onSelect={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  projectId: project.id === formData.projectId ? '' : project.id 
                                }));
                                setProjectSearchOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{project.name}</span>
                                {project.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {project.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                      <CommandGroup heading="Equipes">
                        {filteredProjectsAndTeams
                          .filter(item => item.type === 'team')
                          .map((team) => (
                            <CommandItem
                              key={team.id}
                              value={team.id}
                              onSelect={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  projectId: team.id === formData.projectId ? '' : team.id 
                                }));
                                setProjectSearchOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{team.name}</span>
                                {team.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {team.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Gostaria que você se junte à nossa equipe"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiration">Data de expiração do convite</Label>
            <Select
              value={formData.expirationDays.toString()}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, expirationDays: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="generate-link">Gerar link copiável</Label>
                <p className="text-sm text-muted-foreground">
                  Criar link que pode ser compartilhado
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    id="generate-link"
                    checked={formData.generateLink}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, generateLink: checked }))
                    }
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Link válido por {formData.expirationDays} dias neste navegador</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="send-notification">Notificação interna</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar no inbox do aplicativo
                </p>
              </div>
              <Switch
                id="send-notification"
                checked={formData.sendNotification}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, sendNotification: checked }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !!emailError || !formData.recipientEmail || !formData.recipientName}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar convite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}