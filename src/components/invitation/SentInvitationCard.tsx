import { useState } from 'react';
import { Clock, Mail, MoreHorizontal, RefreshCw, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';
import { Invitation } from '@/types/invitation';
import { User } from '@/data/mockData';

interface SentInvitationCardProps {
  invitation: Invitation;
  currentUser: User;
}

export function SentInvitationCard({ invitation, currentUser }: SentInvitationCardProps) {
  const { resendInvitation, cancelInvitation } = useInvitations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Check if invitation is expired
  const isExpired = new Date() > invitation.expiresAt;
  const actualStatus = (invitation.status === 'pending' && isExpired) ? 'expired' : invitation.status;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-500', 
          text: 'Pendente', 
          icon: <Clock className="h-3 w-3" />,
          variant: 'secondary' as const
        };
      case 'accepted':
        return { 
          color: 'bg-green-500', 
          text: 'Aceito', 
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'default' as const
        };
      case 'rejected':
        return { 
          color: 'bg-red-500', 
          text: 'Recusado', 
          icon: <XCircle className="h-3 w-3" />,
          variant: 'destructive' as const
        };
      case 'expired':
        return { 
          color: 'bg-gray-500', 
          text: 'Expirado', 
          icon: <Clock className="h-3 w-3" />,
          variant: 'outline' as const
        };
      case 'cancelled':
        return { 
          color: 'bg-gray-500', 
          text: 'Cancelado', 
          icon: <XCircle className="h-3 w-3" />,
          variant: 'outline' as const
        };
      default:
        return { 
          color: 'bg-gray-500', 
          text: 'Desconhecido', 
          icon: <Clock className="h-3 w-3" />,
          variant: 'outline' as const
        };
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const result = await resendInvitation(invitation.id, currentUser);
      if (result.success) {
        toast({
          title: "Convite reenviado",
          description: `Convite reenviado para ${invitation.recipientEmail}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reenviar convite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const result = await cancelInvitation(invitation.id, currentUser);
      if (result.success) {
        toast({
          title: "Convite cancelado",
          description: `Convite para ${invitation.recipientEmail} foi cancelado`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar convite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusInfo = getStatusInfo(actualStatus);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {invitation.recipientEmail.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{invitation.recipientEmail}</h3>
                <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                  {statusInfo.icon}
                  {statusInfo.text}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {invitation.target.name} • {invitation.role}
              </p>
            </div>
          </div>
          
          {/* Actions Menu */}
          {(actualStatus === 'pending' || actualStatus === 'expired') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleResend}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCancel}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {invitation.message && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground italic">
                "{invitation.message}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Enviado em {format(invitation.createdAt, "dd MMM yyyy", { locale: ptBR })}
            </span>
            <span>
              Expira em {format(invitation.expiresAt, "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>

          {invitation.acceptedAt && (
            <div className="text-sm text-green-600">
              Aceito em {format(invitation.acceptedAt, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          )}

          {invitation.rejectedAt && (
            <div className="text-sm text-red-600">
              Recusado em {format(invitation.rejectedAt, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}