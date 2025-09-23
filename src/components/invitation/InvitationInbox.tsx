import { useState } from 'react';
import { Bell, CheckSquare, Clock, Filter, Mail, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InvitationCard } from './InvitationCard';
import { SentInvitationCard } from './SentInvitationCard';
import { useInvitations } from '@/hooks/useInvitations';
import { InvitationStatus } from '@/types/invitation';
import { User } from '@/data/mockData';

interface InvitationInboxProps {
  currentUser: User;
}

export function InvitationInbox({ currentUser }: InvitationInboxProps) {
  const { invitations } = useInvitations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'all'>('all');

  // Filter invitations for current user
  const userInvitations = invitations.filter(inv => 
    inv.recipientEmail === currentUser.email
  );

  // Apply search and filter
  const filteredInvitations = userInvitations.filter(invitation => {
    const matchesSearch = invitation.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.senderEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
    
    // Check if expired
    const isExpired = new Date() > invitation.expiresAt;
    const actualStatus = (invitation.status === 'pending' && isExpired) ? 'expired' : invitation.status;
    const matchesActualStatus = statusFilter === 'all' || actualStatus === statusFilter;
    
    return matchesSearch && matchesActualStatus;
  });

  // Count invitations by status
  const pendingCount = userInvitations.filter(inv => 
    inv.status === 'pending' && new Date() <= inv.expiresAt
  ).length;
  
  const expiredCount = userInvitations.filter(inv => 
    inv.status === 'pending' && new Date() > inv.expiresAt
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Convites</h2>
          <p className="text-sm text-muted-foreground">
            Convites recebidos para projetos e equipes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar convites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: InvitationStatus | 'all') => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="accepted">Aceitos</SelectItem>
            <SelectItem value="rejected">Recusados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Recebidos ({userInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Enviados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {filteredInvitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg mb-2">Nenhum convite encontrado</CardTitle>
                <CardDescription>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : 'Você não possui convites no momento.'
                  }
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {filteredInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {(() => {
            const sentInvitations = invitations.filter(inv => inv.senderId === currentUser.id);
            const filteredSentInvitations = sentInvitations.filter(invitation => {
              const matchesSearch = invitation.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   invitation.target.name.toLowerCase().includes(searchTerm.toLowerCase());
              
              const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
              
              // Check if expired
              const isExpired = new Date() > invitation.expiresAt;
              const actualStatus = (invitation.status === 'pending' && isExpired) ? 'expired' : invitation.status;
              const matchesActualStatus = statusFilter === 'all' || actualStatus === statusFilter;
              
              return matchesSearch && matchesActualStatus;
            });

            if (filteredSentInvitations.length === 0) {
              return (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle className="text-lg mb-2">Nenhum convite enviado</CardTitle>
                    <CardDescription>
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Tente ajustar os filtros para ver mais resultados.'
                        : 'Você ainda não enviou nenhum convite.'
                      }
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            }

            return (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {filteredSentInvitations.map((invitation) => (
                    <SentInvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </ScrollArea>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}