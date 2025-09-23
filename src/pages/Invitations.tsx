import { useState } from 'react';
import Layout from '@/components/Layout';
import { InvitationInbox } from '@/components/invitation/InvitationInbox';
import { InvitationDevPanel } from '@/components/invitation/InvitationDevPanel';
import { InvitationModal } from '@/components/invitation/InvitationModal';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, Settings } from 'lucide-react';

export default function Invitations() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Você precisa estar logado para ver os convites.</p>
        </div>
      </Layout>
    );
  }

  // Mock target for general invitations
  const generalTarget = {
    type: 'organization' as const,
    id: 'org-1',
    name: 'Planeja Organization'
  };

  return (
    <Layout>
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header with New Invitation button */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">Convites</h1>
              <p className="text-muted-foreground">
                Gerencie convites enviados e recebidos
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Novo Convite
            </Button>
          </div>

          <Tabs defaultValue="inbox" className="space-y-6">
            <TabsList>
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Convites
              </TabsTrigger>
              <TabsTrigger value="dev" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Desenvolvimento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox">
              <InvitationInbox currentUser={user as any} />
            </TabsContent>

            <TabsContent value="dev">
              <InvitationDevPanel currentUser={user as any} />
            </TabsContent>
          </Tabs>

          {/* Invitation Modal */}
          <InvitationModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            target={generalTarget}
            currentUser={user as any}
            currentUserRole="admin"
            availableTeams={[]}
          />
        </div>
      </div>
    </Layout>
  );
}