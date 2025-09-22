import { useState, useEffect } from 'react';
import { Calendar, Copy, Link, Mail, Users, X } from 'lucide-react';
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
import { User, Team } from '@/data/mockData';

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
    role: 'member',
    teams: [],
    message: '',
    expirationDays: 7,
    generateLink: false,
    sendNotification: true
  });

  const [selectedContact, setSelectedContact] = useState<CircleContact | null>(null);
  const [emailError, setEmailError] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        recipientEmail: '',
        role: 'member',
        teams: [],
        message: '',
        expirationDays: 7,
        generateLink: false,
        sendNotification: true
      });
      setSelectedContact(null);
      setEmailError('');
    }
  }, [open]);

  // Update email when contact is selected
  useEffect(() => {
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        recipientEmail: selectedContact.email,
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
          {/* Contact Selection */}
          <div className="space-y-2">
            <Label htmlFor="contact-select">Escolher do círculo</Label>
            <ContactSelector
              onSelect={setSelectedContact}
              selectedContact={selectedContact}
              placeholder="Buscar no círculo de contatos..."
            />
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do convidado</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.recipientEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={emailError ? 'border-destructive' : ''}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Papel</Label>
            <Select
              value={formData.role}
              onValueChange={(value: InvitationRole) => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                  <SelectItem 
                    key={role} 
                    value={role}
                    disabled={!canAssignRole(role as InvitationRole)}
                  >
                    <div className="flex flex-col">
                      <span className="capitalize font-medium">{role}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canAssignRole(formData.role) && (
              <p className="text-sm text-muted-foreground">
                ⚠️ Você não pode atribuir um papel superior ao seu.
              </p>
            )}
          </div>

          {/* Team Selection */}
          {availableTeams.length > 0 && (
            <div className="space-y-2">
              <Label>Equipes (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {availableTeams.map((team) => {
                  const isSelected = formData.teams.includes(team.id);
                  return (
                    <Badge
                      key={team.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          teams: isSelected
                            ? prev.teams.filter(id => id !== team.id)
                            : [...prev.teams, team.id]
                        }));
                      }}
                    >
                      {team.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem pessoal ao convite..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiration">Expiração do convite</Label>
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
            disabled={isLoading || !!emailError || !formData.recipientEmail}
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