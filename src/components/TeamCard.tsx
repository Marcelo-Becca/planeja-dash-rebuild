import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, FolderOpen, Edit, Archive, Trash2 } from 'lucide-react';
import { Team } from '@/data/mockData';

interface TeamCardProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onArchive?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export function TeamCard({ team, onEdit, onArchive, onDelete }: TeamCardProps) {
  const getStatusColor = (status: Team['status']) => {
    return status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-muted-foreground/20';
  };

  const getTeamColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-l-primary',
      green: 'border-l-emerald-500',
      purple: 'border-l-purple-500',
      orange: 'border-l-orange-500',
      red: 'border-l-red-500'
    };
    return colorMap[color] || 'border-l-primary';
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${getTeamColorClass(team.color)} bg-card/50 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
              <Link to={`/teams/${team.id}`} className="hover:underline">
                {team.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {team.description}
            </p>
            <Badge variant="secondary" className={getStatusColor(team.status)}>
              {team.status === 'active' ? 'Ativa' : 'Arquivada'}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(team)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.(team)}>
                <Archive className="mr-2 h-4 w-4" />
                {team.status === 'active' ? 'Arquivar' : 'Desarquivar'}
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
              <span>{team.members.length} membros</span>
            </div>
            {team.projects.length > 0 && (
              <div className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                <span>{team.projects.length} projetos</span>
              </div>
            )}
          </div>

          {/* Member Avatars */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Membros:</span>
            <div className="flex -space-x-2">
              {team.members.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {member.user.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team.members.length > 3 && (
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{team.members.length - 3}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Project */}
          {team.projects[0] && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Projeto principal:</p>
              <Link 
                to={`/projects/${team.projects[0].id}`}
                className="text-sm font-medium hover:text-primary transition-colors hover:underline"
              >
                {team.projects[0].name}
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}