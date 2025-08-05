'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Shield,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  provider?: string;
  features: string[];
  permissions: string[];
}

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync coaching sessions with Google Calendar',
      icon: Calendar,
      connected: false,
      provider: 'google',
      features: [
        'Automatic session creation',
        'Two-way sync',
        'Google Meet integration',
        'Availability checking'
      ],
      permissions: [
        'View and edit calendar events',
        'Create video conferences',
        'Send invitations'
      ]
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send emails and manage client communications',
      icon: Mail,
      connected: false,
      provider: 'google',
      features: [
        'Send templated emails',
        'Track conversations',
        'Automated reminders',
        'Bulk messaging'
      ],
      permissions: [
        'Send emails on your behalf',
        'Read email metadata',
        'Create drafts'
      ]
    },
    {
      id: 'apple-calendar',
      name: 'Apple Calendar',
      description: 'Sync coaching sessions with Apple Calendar',
      icon: Calendar,
      connected: false,
      provider: 'apple',
      features: [
        'Session synchronization',
        'iCloud integration',
        'Native iOS/macOS support'
      ],
      permissions: [
        'Access calendar events',
        'Create and modify events'
      ]
    },
    {
      id: 'apple-mail',
      name: 'Apple Mail',
      description: 'Integrate with Apple Mail for communications',
      icon: Mail,
      connected: false,
      provider: 'apple',
      features: [
        'Email templates',
        'Client messaging',
        'iCloud Mail support'
      ],
      permissions: [
        'Send emails',
        'Access mailbox'
      ]
    }
  ]);

  useEffect(() => {
    // Check current integration status based on session
    if (session?.provider === 'google' && session?.accessToken) {
      setIntegrations(prev => prev.map(integration => {
        if (integration.provider === 'google') {
          return { ...integration, connected: true };
        }
        return integration;
      }));
    }
  }, [session]);

  const handleConnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integration.provider === 'google') {
      // For Google services, we need to re-authenticate with additional scopes
      toast({
        title: 'Reconnect Required',
        description: 'Please sign in again to grant calendar and email permissions.',
      });
      // TODO: Trigger re-authentication with additional scopes
    } else if (integration.provider === 'apple') {
      toast({
        title: 'Coming Soon',
        description: 'Apple integrations will be available soon.',
      });
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    // TODO: Implement disconnection logic
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        return { ...integration, connected: false };
      }
      return integration;
    }));
    
    toast({
      title: 'Integration Disconnected',
      description: 'The integration has been removed.',
    });
  };

  const handleToggleSync = async (integrationId: string, enabled: boolean) => {
    // TODO: Implement sync toggle logic
    toast({
      title: enabled ? 'Sync Enabled' : 'Sync Disabled',
      description: `Automatic synchronization has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your calendar and email to streamline your coaching workflow
        </p>
      </div>

      {/* OAuth Status */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You're signed in with {session?.provider === 'google' ? 'Google' : 'Apple'}. 
          Some integrations require additional permissions.
        </AlertDescription>
      </Alert>

      {/* Integration Cards */}
      <div className="grid gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          
          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={integration.connected ? "default" : "secondary"}>
                    {integration.connected ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Not Connected
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Required Permissions</h4>
                    <ul className="space-y-1">
                      {integration.permissions.map((permission, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {integration.connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`sync-${integration.id}`}>
                        Automatic Synchronization
                      </Label>
                      <Switch
                        id={`sync-${integration.id}`}
                        defaultChecked
                        onCheckedChange={(checked) => handleToggleSync(integration.id, checked)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleConnect(integration.id)}
                    disabled={integration.provider === 'apple'}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect {integration.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Configure how integrations work with your coaching platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Session Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send reminders 24 hours before sessions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Calendar Blocking</Label>
              <p className="text-sm text-muted-foreground">
                Block time in your calendar for session preparation
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Templates</Label>
              <p className="text-sm text-muted-foreground">
                Use AI to personalize email templates
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}