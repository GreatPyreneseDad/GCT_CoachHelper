'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Save, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useOptimisticUpdate } from '@/hooks/use-optimistic-update';

interface Setting {
  id: string;
  label: string;
  description?: string;
  value: boolean | string | number;
  type: 'boolean' | 'select' | 'number';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

interface ProgressiveSettingsProps {
  settings: Setting[];
  onUpdate: (id: string, value: any) => Promise<void>;
  className?: string;
  showSaveIndicator?: boolean;
  autoSave?: boolean;
  saveDelay?: number;
}

function SettingItem({ 
  setting, 
  onUpdate,
  autoSave = true,
}: { 
  setting: Setting; 
  onUpdate: (value: any) => Promise<void>;
  autoSave?: boolean;
}) {
  const [localValue, setLocalValue] = useState(setting.value);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { value, update, isPending } = useOptimisticUpdate(
    setting.value,
    onUpdate,
    {
      successMessage: autoSave ? undefined : 'Setting saved',
    }
  );

  const handleChange = async (newValue: any) => {
    setLocalValue(newValue);

    if (autoSave) {
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        update(newValue);
      }, 500);

      setSaveTimeout(timeout);
    } else {
      // Manual save mode - update immediately
      await update(newValue);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg",
        "border transition-colors",
        isPending && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex-1 pr-4">
        <Label htmlFor={setting.id} className="text-base font-medium">
          {setting.label}
        </Label>
        {setting.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {setting.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {setting.type === 'boolean' && (
          <Switch
            id={setting.id}
            checked={localValue as boolean}
            onCheckedChange={handleChange}
            disabled={isPending}
            aria-label={setting.label}
          />
        )}

        {setting.type === 'select' && setting.options && (
          <select
            id={setting.id}
            value={localValue as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isPending}
            className={cn(
              "px-3 py-2 rounded-md",
              "bg-background border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            aria-label={setting.label}
          >
            {setting.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {setting.type === 'number' && (
          <input
            id={setting.id}
            type="number"
            value={localValue as number}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            disabled={isPending}
            className={cn(
              "w-24 px-3 py-2 rounded-md text-right",
              "bg-background border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            aria-label={setting.label}
          />
        )}

        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </motion.div>
          ) : localValue !== value ? (
            <motion.div
              key="unsaved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="h-2 w-2 rounded-full bg-warning" />
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Check className="h-4 w-4 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ProgressiveSettings({
  settings,
  onUpdate,
  className,
  showSaveIndicator = true,
  autoSave = true,
}: ProgressiveSettingsProps) {
  const [savedSettings, setSavedSettings] = useState<Set<string>>(new Set());
  const [failedSettings, setFailedSettings] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (id: string, value: any) => {
    startTransition(async () => {
      try {
        await onUpdate(id, value);
        setSavedSettings(prev => new Set([...prev, id]));
        setFailedSettings(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        // Clear saved indicator after 2 seconds
        setTimeout(() => {
          setSavedSettings(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 2000);
      } catch (error) {
        setFailedSettings(prev => new Set([...prev, id]));
        throw error;
      }
    });
  };

  const hasUnsavedChanges = settings.some(setting => 
    savedSettings.has(setting.id) || failedSettings.has(setting.id)
  );

  return (
    <div className={cn("space-y-4", className)}>
      {showSaveIndicator && (
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg",
                "bg-muted/50 border border-muted-foreground/20"
              )}>
                <div className="flex items-center gap-2">
                  {failedSettings.size > 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        Some settings failed to save
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        All changes saved
                      </span>
                    </>
                  )}
                </div>
                {!autoSave && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md",
                      "bg-primary text-primary-foreground",
                      "hover:bg-primary/90 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    )}
                  >
                    <Save className="h-3 w-3" />
                    <span className="text-sm">Save All</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="space-y-2">
        {settings.map((setting, index) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SettingItem
              setting={setting}
              onUpdate={(value) => handleUpdate(setting.id, value)}
              autoSave={autoSave}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Notification preferences component with instant feedback
interface NotificationSetting {
  id: string;
  label: string;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface NotificationPreferencesProps {
  settings: NotificationSetting[];
  onUpdate: (id: string, channel: keyof NotificationSetting['channels'], value: boolean) => Promise<void>;
  className?: string;
}

export function NotificationPreferences({
  settings,
  onUpdate,
  className,
}: NotificationPreferencesProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleToggle = async (
    settingId: string, 
    channel: keyof NotificationSetting['channels'], 
    currentValue: boolean
  ) => {
    const itemKey = `${settingId}-${channel}`;
    setUpdatingItems(prev => new Set([...prev, itemKey]));

    try {
      await onUpdate(settingId, channel, !currentValue);
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-4 pb-2 border-b">
        <div className="text-sm font-medium">Notification Type</div>
        <div className="text-sm font-medium text-center">Email</div>
        <div className="text-sm font-medium text-center">Push</div>
        <div className="text-sm font-medium text-center">SMS</div>
      </div>

      {settings.map((setting, index) => (
        <motion.div
          key={setting.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="grid grid-cols-4 gap-4 items-center py-3"
        >
          <div className="text-sm">{setting.label}</div>
          
          {(['email', 'push', 'sms'] as const).map(channel => {
            const itemKey = `${setting.id}-${channel}`;
            const isUpdating = updatingItems.has(itemKey);
            
            return (
              <div key={channel} className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggle(setting.id, channel, setting.channels[channel])}
                  disabled={isUpdating}
                  className={cn(
                    "relative w-10 h-6 rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    setting.channels[channel] ? "bg-primary" : "bg-muted"
                  )}
                  aria-label={`${channel} notifications for ${setting.label}`}
                >
                  <motion.div
                    layout
                    className={cn(
                      "absolute top-1 h-4 w-4 rounded-full bg-white",
                      "shadow-sm transition-transform"
                    )}
                    animate={{
                      left: setting.channels[channel] ? '20px' : '4px',
                    }}
                  />
                  {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  )}
                </motion.button>
              </div>
            );
          })}
        </motion.div>
      ))}
    </div>
  );
}