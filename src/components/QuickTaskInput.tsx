import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickTaskInputProps {
  projectId: string;
  onTaskCreated: (title: string) => void;
  className?: string;
}

export default function QuickTaskInput({ projectId, onTaskCreated, className }: QuickTaskInputProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onTaskCreated(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Criar tarefa rápida... (pressione Enter)"
          className="pl-10"
        />
      </div>
    </form>
  );
}
