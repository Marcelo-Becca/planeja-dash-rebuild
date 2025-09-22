import { useState } from 'react';
import { Check, X, Clock, AlertCircle, User, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInvitations } from '@/hooks/useInvitations';
import { Invitation, ROLE_DESCRIPTIONS } from '@/types/invitation';
import { User as UserType } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvitationCardProps {
  invitation: Invitation;
  currentUser: UserType;
  onAccept?: () => void;
  onReject?: () => void;
}

export function InvitationCard({ invitation, currentUser, onAccept, onReject }: InvitationCardProps) {
  const { acceptInvitation, rejectInvitation, isLoading } = useInvitations();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');

  const isExpired = new Date() > invitation.expiresAt;
  const isRecipient = currentUser.email === invitation.recipientEmail;
  const isPending = invitation.status === 'pending' && !isExpired;

  const getStatusInfo = () => {
    if (isExpired && invitation.status === 'pending') {
      return {
        color: 'destructive' as const,
        label: 'Expirado',
        icon: AlertCircle
      };
    }

    switch (invitation.status) {
      case 'pending':
        return {
          color: 'secondary' as const,
          label: 'Pendente',
          icon: Clock
        };
      case 'accepted':
        return {
          color: 'default' as const,
          label: 'Aceito',
          icon: Check
        };
      case 'rejected':
        return {
          color: 'outline' as const,
          label: 'Recusado',
          icon: X
        };
      case 'cancelled':
        return {
          color: 'outline' as const,
          label: 'Cancelado',
          icon: X
        };
      default:
        return {
          color: 'secondary' as const,
          label: 'Pendente',
          icon: Clock
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleAction = async (action: 'accept' | 'reject') => {
    if (action === 'accept') {
      const result = await acceptInvitation(invitation.id, currentUser);
      if (result.success) {
        onAccept?.();
      }
    } else {
      const result = await rejectInvitation(invitation.id, currentUser);
      if (result.success) {
        onReject?.();
      }
    }
    setShowConfirmDialog(false);
  };

  const openConfirmDialog = (action: 'accept' | 'reject') => {
    setActionType(action);
    setShowConfirmDialog(true);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {invitation.senderName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{invitation.senderName}</CardTitle>
                <CardDescription>{invitation.senderEmail}</CardDescription>
              </div>
            </div>
            <Badge variant={statusInfo.color} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <p className="text-sm">
              <span className="font-medium">Convidou você para:</span>{' '}
              <span className="font-semibold">{invitation.target.name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Como <span className="font-medium capitalize">{invitation.role}</span> • {ROLE_DESCRIPTIONS[invitation.role]}
            </p>
          </div>

          {invitation.teams.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Equipes: {invitation.teams.join(', ')}</span>
            </div>
          )}

          {invitation.message && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Mensagem personalizada:</span>
              </div>
              <p className="text-sm bg-muted p-2 rounded-md italic">
                "{invitation.message}"
              </p>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                Enviado {formatDistanceToNow(invitation.createdAt, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {isExpired ? 'Expirado' : `Expira ${formatDistanceToNow(invitation.expiresAt, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}`}
              </span>
            </div>
          </div>
        </CardContent>

        {isRecipient && isPending && (
          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openConfirmDialog('reject')}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Recusar
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => openConfirmDialog('accept')}
                disabled={isLoading}
              >
                <Check className="h-4 w-4 mr-1" />
                Aceitar
              </Button>
            </div>
          </CardFooter>
        )}

        {!isRecipient && invitation.status === 'pending' && (
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Aguardando resposta do destinatário
            </p>
          </CardFooter>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Aceitar convite' : 'Recusar convite'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' 
                ? `Você será adicionado como ${invitation.role} em "${invitation.target.name}".`
                : `Tem certeza que deseja recusar este convite para "${invitation.target.name}"?`
              }
            </DialogDescription>
          </DialogHeader>

          {actionType === 'accept' && (
            <div className="space-y-2 py-4">
              <h4 className="font-medium text-sm">O que será concedido:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Papel: <span className="font-medium capitalize">{invitation.role}</span></li>
                <li>• Permissões: {ROLE_DESCRIPTIONS[invitation.role]}</li>
                {invitation.teams.length > 0 && (
                  <li>• Equipes: {invitation.teams.join(', ')}</li>
                )}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant={actionType === 'accept' ? 'default' : 'destructive'}
              onClick={() => handleAction(actionType)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {actionType === 'accept' ? 'Aceitando...' : 'Recusando...'}
                </>
              ) : (
                <>
                  {actionType === 'accept' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Aceitar e Entrar
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Recusar
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}