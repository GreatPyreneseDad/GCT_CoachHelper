'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Chrome,
  Link,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  QrCode,
  Shield,
  Activity,
  Users,
  Settings,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionStatus {
  connected: boolean;
  version?: string;
  lastSync?: Date;
  activeClients: number;
}

export default function ExtensionSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    connected: false,
    activeClients: 0,
  });
  const [linkCode, setLinkCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [settings, setSettings] = useState({
    autoSync: true,
    realTimeMonitoring: true,
    conversationTracking: true,
    clientNotifications: true,
    dataRetention: '30',
  });

  useEffect(() => {
    // Check if extension is installed and connected
    checkExtensionStatus();
  }, []);

  const checkExtensionStatus = async () => {
    // Check for extension via custom event or API
    try {
      // Simulate checking extension status
      const isConnected = !!window.localStorage.getItem('gct_extension_connected');
      if (isConnected) {
        setExtensionStatus({
          connected: true,
          version: '1.2.3',
          lastSync: new Date(),
          activeClients: 12,
        });
      }
    } catch (error) {
      console.error('Error checking extension:', error);
    }
  };

  const generateLinkCode = async () => {
    setIsGeneratingCode(true);
    try {
      // Generate unique link code for this coach
      await new Promise(resolve => setTimeout(resolve, 1000));
      const code = `${session?.user?.id?.slice(0, 8)}-${Date.now().toString(36)}`.toUpperCase();
      setLinkCode(code);
      
      toast({
        title: 'Link code generated',
        description: 'Share this code with the Chrome extension',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate link code',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyLinkCode = () => {
    navigator.clipboard.writeText(linkCode);
    toast({
      title: 'Copied!',
      description: 'Link code copied to clipboard',
    });
  };

  const disconnectExtension = async () => {
    try {
      // TODO: API call to disconnect extension
      window.localStorage.removeItem('gct_extension_connected');
      setExtensionStatus({
        connected: false,
        activeClients: 0,
      });
      setLinkCode('');
      
      toast({
        title: 'Extension disconnected',
        description: 'Chrome extension has been unlinked',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect extension',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chrome Extension</h1>
        <p className="text-muted-foreground">
          Connect and manage the GCT coherence monitoring extension
        </p>
      </div>

      {/* Extension Status */}
      <Card className={cn(
        "border-2",
        extensionStatus.connected ? "border-green-500/50" : "border-muted"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Chrome className={cn(
                "h-8 w-8",
                extensionStatus.connected ? "text-green-500" : "text-muted-foreground"
              )} />
              <div>
                <CardTitle>Extension Status</CardTitle>
                <CardDescription>
                  {extensionStatus.connected 
                    ? 'Chrome extension is connected and active'
                    : 'Chrome extension is not connected'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={extensionStatus.connected ? "default" : "secondary"}>
              {extensionStatus.connected ? (
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
        {extensionStatus.connected && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">{extensionStatus.version}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Sync</p>
                <p className="font-medium">
                  {extensionStatus.lastSync?.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Clients</p>
                <p className="font-medium">{extensionStatus.activeClients}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          {!extensionStatus.connected ? (
            <>
              {/* Installation Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Install Chrome Extension</CardTitle>
                  <CardDescription>
                    Follow these steps to set up coherence monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Download the extension</p>
                        <p className="text-sm text-muted-foreground">
                          Get the GCT Coherence Monitor from Chrome Web Store
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Download className="mr-2 h-4 w-4" />
                          Chrome Web Store
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Generate link code</p>
                        <p className="text-sm text-muted-foreground">
                          Create a unique code to connect the extension
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Enter code in extension</p>
                        <p className="text-sm text-muted-foreground">
                          Open the extension and paste your link code
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Link Code Generation */}
              <Card>
                <CardHeader>
                  <CardTitle>Link Code</CardTitle>
                  <CardDescription>
                    Generate a code to connect your Chrome extension
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {linkCode ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Input
                          value={linkCode}
                          readOnly
                          className="font-mono text-lg"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyLinkCode}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This code expires in 10 minutes. Enter it in the Chrome extension to complete setup.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <Button
                      onClick={generateLinkCode}
                      disabled={isGeneratingCode}
                      className="w-full"
                    >
                      {isGeneratingCode ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate Link Code
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Extension Connected</CardTitle>
                <CardDescription>
                  Your Chrome extension is successfully linked
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    The extension is actively monitoring coherence for {extensionStatus.activeClients} clients
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  onClick={disconnectExtension}
                >
                  Disconnect Extension
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Extension Settings</CardTitle>
              <CardDescription>
                Configure how the extension monitors and reports data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync data in real-time as it's collected
                  </p>
                </div>
                <Switch
                  id="autoSync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoSync: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="realTime">Real-time Monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Show live coherence updates on dashboard
                  </p>
                </div>
                <Switch
                  id="realTime"
                  checked={settings.realTimeMonitoring}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, realTimeMonitoring: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="conversations">Conversation Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor coherence in chat conversations
                  </p>
                </div>
                <Switch
                  id="conversations"
                  checked={settings.conversationTracking}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, conversationTracking: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Client Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when client coherence needs attention
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.clientNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, clientNotifications: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="retention">Data Retention</Label>
                <Select
                  value={settings.dataRetention}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, dataRetention: value }))
                  }
                >
                  <SelectTrigger id="retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How long to keep detailed coherence data
                </p>
              </div>

              <Button className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Connected Clients</CardTitle>
              <CardDescription>
                Clients who have installed and connected the extension
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extensionStatus.activeClients > 0 ? (
                <div className="space-y-3">
                  {/* Mock client list */}
                  {[
                    { name: 'Sarah Mitchell', status: 'active', lastSeen: '2 min ago' },
                    { name: 'John Davis', status: 'active', lastSeen: '15 min ago' },
                    { name: 'Emily Chen', status: 'inactive', lastSeen: '2 hours ago' },
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          client.status === 'active' ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last seen {client.lastSeen}
                          </p>
                        </div>
                      </div>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No clients have connected the extension yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}