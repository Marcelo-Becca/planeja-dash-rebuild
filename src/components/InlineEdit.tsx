import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  validation?: (value: string) => string | null;
  required?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  multiline = false,
  placeholder,
  className,
  displayClassName,
  validation,
  required = false
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, multiline]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const validateValue = (val: string) => {
    if (required && !val.trim()) {
      return 'Este campo é obrigatório';
    }
    if (validation) {
      return validation(val);
    }
    return null;
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    const validationError = validateValue(trimmedValue);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    if (trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    
    return (
      <div ref={containerRef} className={cn("space-y-2", className)}>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <InputComponent
              ref={inputRef as any}
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "w-full",
                error && "border-destructive focus-visible:ring-destructive",
                multiline && "min-h-[80px] resize-none"
              )}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
            {multiline && (
              <p className="text-xs text-muted-foreground mt-1">
                Ctrl+Enter para salvar, Esc para cancelar
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "group flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded-md p-1 -m-1 transition-colors",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span className={cn("flex-1", displayClassName)}>
        {value || placeholder}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}