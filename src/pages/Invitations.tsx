import Layout from '@/components/Layout';
import { InvitationInbox } from '@/components/invitation/InvitationInbox';
import { InvitationDevPanel } from '@/components/invitation/InvitationDevPanel';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings } from 'lucide-react';

export default function Invitations() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Você precisa estar logado para ver os convites.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </div>
    </Layout>
  );
}