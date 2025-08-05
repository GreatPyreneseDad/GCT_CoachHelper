'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptimisticUpdate } from '@/hooks/use-optimistic-update';
import { cn } from '@/lib/utils';

type InlineTextEditorProps = {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
};

export function InlineTextEditor({
  value,
  onSave,
  className,
  multiline = false,
  placeholder = 'Click to edit',
  maxLength,
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const { data, update, isPending } = useOptimisticUpdate(value, onSave);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue.trim() === data.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      await update(editValue);
      setIsEditing(false);
    } catch (error) {
      // Revert to original value on error
      setEditValue(data);
    }
  };

  const handleCancel = () => {
    setEditValue(data);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        className={cn(
          'group relative inline-flex items-center gap-2 cursor-pointer rounded-md transition-colors hover:bg-muted/50',
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <span className={cn(!data && 'text-muted-foreground')}>
          {data || placeholder}
        </span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn('inline-flex items-start gap-2', className)}>
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={cn(multiline && 'min-h-[80px]')}
        disabled={isPending}
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isPending}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {maxLength && (
        <span className="text-xs text-muted-foreground">
          {editValue.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

type InlineTagEditorProps = {
  tags: string[];
  onSave: (tags: string[]) => Promise<void>;
  suggestions?: string[];
  maxTags?: number;
};

export function InlineTagEditor({
  tags,
  onSave,
  suggestions = [],
  maxTags = 10,
}: InlineTagEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: currentTags, update, isPending } = useOptimisticUpdate(tags, onSave);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTag = async () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (!trimmedTag || currentTags.includes(trimmedTag)) {
      setNewTag('');
      setIsAdding(false);
      return;
    }

    try {
      await update([...currentTags, trimmedTag]);
      setNewTag('');
      setIsAdding(false);
    } catch (error) {
      // Error handled by optimistic update
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    try {
      await update(currentTags.filter(tag => tag !== tagToRemove));
    } catch (error) {
      // Error handled by optimistic update
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTag('');
      setIsAdding(false);
    }
  };

  const availableSuggestions = suggestions.filter(
    s => !currentTags.includes(s) && s.includes(newTag.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {currentTags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Badge variant="secondary" className="group pr-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                  disabled={isPending}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag}</span>
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {currentTags.length < maxTags && (
          <>
            {isAdding ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={inputRef}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newTag) setIsAdding(false);
                  }}
                  placeholder="Add tag..."
                  className="h-6 w-32 text-sm"
                  disabled={isPending}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddTag}
                  disabled={isPending}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAdding(true)}
                disabled={isPending}
                className="h-6 gap-1 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add tag
              </Button>
            )}
          </>
        )}
      </div>
      
      {isAdding && availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {availableSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setNewTag(suggestion)}
              className="text-xs text-primary hover:underline"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}