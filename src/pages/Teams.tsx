import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import CreateTeamModal from '@/components/CreateTeamModal';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamCard } from '@/components/TeamCard';
import { Plus, Search, Users, Filter } from 'lucide-react';
import { useTeams, Team } from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';

export default function Teams() {
  const { teams, loading, deleteTeam } = useTeams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchTerm, teams]);

  const handleCreateTeam = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    toast({
      title: "Editando equipe",
      description: `Abrindo editor para: ${team.name}`,
    });
  };

  const handleDeleteTeam = async (team: Team) => {
    if (confirm(`Tem certeza que deseja excluir a equipe "${team.name}"?`)) {
      await deleteTeam(team.id);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Equipes
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Gerencie suas equipes e organize seus times de trabalho
                </p>
              </div>
              
              <Button 
                onClick={handleCreateTeam}
                size="lg" 
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nova Equipe
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <Users className="mr-2 h-4 w-4" />
                {teams.length} {teams.length === 1 ? 'Equipe' : 'Equipes'}
              </Badge>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border shadow-sm p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Teams Grid or Empty State */}
          {filteredTeams.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team as any}
                  onEdit={handleEditTeam as any}
                  onDelete={handleDeleteTeam as any}
                />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="Nenhuma equipe criada ainda"
              description="Comece criando sua primeira equipe para colaborar em projetos e organizar membros."
              actionLabel="Criar primeira equipe"
              onAction={handleCreateTeam}
            />
          ) : (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="Nenhuma equipe encontrada"
              description="Nenhuma equipe corresponde aos filtros aplicados. Tente ajustar sua busca ou filtros."
            />
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </Layout>
  );
}