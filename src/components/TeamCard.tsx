import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, Target, Edit, Trash2 } from 'lucide-react';
import { Team } from '@/hooks/useTeams';
import { useLocalData } from '@/hooks/useLocalData';
interface TeamCardProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}
export function TeamCard({
  team,
  onEdit,
  onDelete
}: TeamCardProps) {
  const {
    users
  } = useLocalData();

  // Get member user objects from IDs
  const teamMembers = users.filter(user => team.members?.includes(user.id));
  const teamLeader = users.find(user => user.id === team.leader_id);
  return <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
              <Link to={`/teams/${team.id}`} className="hover:underline">
                {team.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {team.description || 'Sem descrição'}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(team)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(team)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Team Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{teamMembers.length} {teamMembers.length === 1 ? 'membro' : 'membros'}</span>
            </div>
            {team.main_objective && <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span className="truncate max-w-[150px]">{team.main_objective}</span>
              </div>}
          </div>

          {/* Leader */}
          {teamLeader && <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Líder:</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {teamLeader.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{teamLeader.name}</span>
              </div>
            </div>}

          {/* Member Avatars */}
          {teamMembers.length > 0 && <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Membros:</span>
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 3).map(member => <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>)}
                {teamMembers.length > 3 && <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{teamMembers.length - 3}</span>
                  </div>}
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
}