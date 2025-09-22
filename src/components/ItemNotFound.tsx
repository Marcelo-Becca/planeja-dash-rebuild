import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ItemNotFoundProps {
  type: 'projeto' | 'tarefa' | 'equipe';
  searchTerm?: string;
  onSearch?: (term: string) => void;
  onRestore?: () => void;
  backLink: string;
  backLabel: string;
  suggestions?: Array<{
    id: string;
    name: string;
    link: string;
  }>;
}

export function ItemNotFound({
  type,
  searchTerm,
  onSearch,
  onRestore,
  backLink,
  backLabel,
  suggestions = []
}: ItemNotFoundProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground capitalize">
              {type} não encontrado
            </h2>
            <p className="text-muted-foreground">
              O {type} que você está procurando não existe mais ou foi removido.
            </p>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Talvez você esteja procurando por:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <Link
                    key={suggestion.id}
                    to={suggestion.link}
                    className="block p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-primary hover:underline">
                      {suggestion.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={backLink}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </Link>

            {onSearch && (
              <Button
                variant="outline"
                onClick={() => {
                  const searchTerm = prompt(`Buscar ${type} por nome:`);
                  if (searchTerm) {
                    onSearch(searchTerm);
                  }
                }}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            )}

            {onRestore && (
              <Button
                variant="outline"
                onClick={onRestore}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ou volte ao início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}