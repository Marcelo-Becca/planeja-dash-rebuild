import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Undo2 } from 'lucide-react';

interface UndoAction {
  undo: () => void;
  message: string;
}

export function useUndoToast() {
  const { toast } = useToast();

  const showUndoToast = (action: string, undoAction: UndoAction) => {
    toast({
      title: action,
      description: (
        <div className="flex items-center justify-between">
          <span>{undoAction.message}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              undoAction.undo();
            }}
            className="ml-3 h-8 gap-1"
          >
            <Undo2 className="h-3 w-3" />
            Desfazer
          </Button>
        </div>
      ),
      duration: 5000,
    });
  };

  return { showUndoToast };
}