import { Label } from '@/components/ui/label';
import { X, CheckCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

// Accessible radio group with error handling
export function AccessibleRadioGroup({
  name,
  label,
  options,
  defaultValue,
  error,
  required = false
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  const groupId = `${name}-group`;
  const errorId = `${name}-error`;
  
  return (
    <fieldset 
      role="radiogroup"
      aria-labelledby={groupId}
      aria-describedby={error ? errorId : undefined}
      aria-required={required}
      aria-invalid={error ? 'true' : 'false'}
    >
      <legend id={groupId} className="font-medium mb-3">
        {label} {required && <span className="text-destructive">*</span>}
      </legend>
      
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === option.value}
              className="mt-0.5"
              aria-describedby={option.description ? `${name}-${option.value}-desc` : undefined}
            />
            <div className="flex-1">
              <div>{option.label}</div>
              {option.description && (
                <div 
                  id={`${name}-${option.value}-desc`}
                  className="text-sm text-muted-foreground"
                >
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// Accessible checkbox group
export function AccessibleCheckboxGroup({
  name,
  label,
  options,
  defaultValues = [],
  error,
  required = false,
  minSelection = 0
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  defaultValues?: string[];
  error?: string;
  required?: boolean;
  minSelection?: number;
}) {
  const groupId = `${name}-group`;
  const errorId = `${name}-error`;
  
  return (
    <fieldset
      aria-labelledby={groupId}
      aria-describedby={error ? errorId : undefined}
      aria-required={required}
      aria-invalid={error ? 'true' : 'false'}
    >
      <legend id={groupId} className="font-medium mb-3">
        {label} {required && <span className="text-destructive">*</span>}
        {minSelection > 0 && (
          <span className="text-sm font-normal text-muted-foreground ml-1">
            (Select at least {minSelection})
          </span>
        )}
      </legend>
      
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={defaultValues.includes(option.value)}
              className="mt-0.5"
              aria-describedby={option.description ? `${name}-${option.value}-desc` : undefined}
            />
            <div className="flex-1">
              <div>{option.label}</div>
              {option.description && (
                <div 
                  id={`${name}-${option.value}-desc`}
                  className="text-sm text-muted-foreground"
                >
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// Success feedback pattern
export function FormSuccessMessage({ 
  message,
  onDismiss 
}: { 
  message: string;
  onDismiss?: () => void;
}) {
  useEffect(() => {
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    return () => {
      document.body.removeChild(announcement);
    };
  }, [message]);
  
  return (
    <div className="rounded-lg bg-green-50 p-4 mb-4">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-green-800">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-3 text-green-400 hover:text-green-500"
            aria-label="Dismiss message"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Loading state indicator that works without JS
export function FormLoadingIndicator() {
  return (
    <>
      {/* CSS-only loading state */}
      <style jsx>{`
        form:has(button[type="submit"]:active) .loading-indicator {
          display: block;
        }
      `}</style>
      <div className="loading-indicator hidden">
        <div className="text-sm text-muted-foreground">Processing...</div>
      </div>
    </>
  );
}

// File upload with progressive preview
export function ImageUploadField({ 
  name, 
  label, 
  defaultValue,
  error 
}: { 
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
}) {
  const previewRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/*"
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && previewRef.current) {
            // Progressive enhancement: show preview if JS available
            const reader = new FileReader();
            reader.onload = (e) => {
              if (previewRef.current && e.target?.result) {
                previewRef.current.src = e.target.result as string;
                previewRef.current.classList.remove('hidden');
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      />
      
      {/* Fallback: Show filename without JS */}
      <noscript>
        <output htmlFor={name} className="text-sm text-muted-foreground">
          No file selected
        </output>
      </noscript>
      
      {/* Preview image (hidden by default) */}
      <img 
        ref={previewRef}
        className="hidden mt-2 max-w-xs rounded border"
        alt="Preview"
      />
      
      {defaultValue && (
        <div className="mt-2">
          <img 
            src={defaultValue} 
            alt="Current image" 
            className="max-w-xs rounded border"
          />
          <p className="text-sm text-muted-foreground mt-1">Current image</p>
        </div>
      )}
      
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

// Auto-save with debouncing (progressive enhancement)
export function AutoSaveForm({ 
  children, 
  action,
  saveInterval = 5000 
}: { 
  children: React.ReactNode;
  action: (formData: FormData) => Promise<void>;
  saveInterval?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    if (!isDirty) return;
    
    const timeoutId = setTimeout(() => {
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        formData.append('_action', 'autosave');
        action(formData);
        setIsDirty(false);
      }
    }, saveInterval);
    
    return () => clearTimeout(timeoutId);
  }, [isDirty, action, saveInterval]);
  
  return (
    <form 
      ref={formRef}
      action={action}
      onChange={() => setIsDirty(true)}
    >
      {children}
      
      {/* Visual indicator for auto-save */}
      {isDirty && (
        <div className="text-sm text-muted-foreground">
          Changes will be saved automatically...
        </div>
      )}
    </form>
  );
}