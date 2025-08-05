'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Chrome,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  Info,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionData {
  connected: boolean;
  version?: string;
  coherenceScore: number;
  coherenceDerivative: number;
  lastUpdate?: Date;
  monitoringActive: boolean;
}

export default function ClientExtensionPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [extensionData, setExtensionData] = useState<ExtensionData>({
    connected: false,
    coherenceScore: 72,
    coherenceDerivative: 0.02,
    monitoringActive: false,
  });
  const [permissions, setPermissions] = useState({
    shareWithCoach: true,
    realTimeUpdates: true,
    conversationMonitoring: false,
  });

  useEffect(() => {
    // Check extension connection
    checkExtensionConnection();
    
    // Listen for extension messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GCT_EXTENSION_UPDATE') {
        setExtensionData(prev => ({
          ...prev,
          coherenceScore: event.data.coherenceScore,
          coherenceDerivative: event.data.derivative,
          lastUpdate: new Date(),
        }));
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkExtensionConnection = async () => {
    try {
      // Check if extension is installed
      const response = await window.postMessage({ type: 'GCT_EXTENSION_PING' }, '*');
      // Simulate connection check
      const isConnected = !!window.localStorage.getItem('gct_client_extension_connected');
      
      if (isConnected) {
        setExtensionData(prev => ({
          ...prev,
          connected: true,
          version: '1.2.3',
          monitoringActive: true,
          lastUpdate: new Date(),
        }));
      }
    } catch (error) {
      console.error('Extension check failed:', error);
    }
  };

  const connectExtension = () => {
    // Simulate connection
    window.localStorage.setItem('gct_client_extension_connected', 'true');
    setExtensionData(prev => ({
      ...prev,
      connected: true,
      version: '1.2.3',
      monitoringActive: true,
    }));
    
    toast({
      title: 'Extension connected!',
      description: 'Coherence monitoring is now active',
    });
  };

  const disconnectExtension = () => {
    window.localStorage.removeItem('gct_client_extension_connected');
    setExtensionData(prev => ({
      ...prev,
      connected: false,
      monitoringActive: false,
    }));
    
    toast({
      title: 'Extension disconnected',
      description: 'Coherence monitoring has been stopped',
    });
  };

  const getCoherenceTrend = () => {
    if (extensionData.coherenceDerivative > 0.01) return 'improving';
    if (extensionData.coherenceDerivative < -0.01) return 'declining';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getCoherenceTrend();
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Coherence Monitor</h1>
          <p className="text-muted-foreground">
            Track your coherence in real-time with the Chrome extension
          </p>
        </div>

        {/* Extension Status */}
        <Card className={cn(
          "border-2",
          extensionData.connected ? "border-primary/50" : "border-muted"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chrome className={cn(
                  "h-8 w-8",
                  extensionData.connected ? "text-primary" : "text-muted-foreground"
                )} />
                <div>
                  <CardTitle>Chrome Extension</CardTitle>
                  <CardDescription>
                    {extensionData.connected 
                      ? 'Monitoring your coherence in real-time'
                      : 'Connect to start tracking your coherence'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={extensionData.connected ? "default" : "secondary"}>
                {extensionData.connected ? (
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
          {extensionData.connected && (
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Coherence</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{extensionData.coherenceScore}%</span>
                    {getTrendIcon()}
                  </div>
                  <Progress value={extensionData.coherenceScore} className="mt-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Coherence Derivative</p>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-3xl font-bold",
                      extensionData.coherenceDerivative > 0 ? "text-green-500" : 
                      extensionData.coherenceDerivative < 0 ? "text-red-500" : "text-blue-500"
                    )}>
                      {extensionData.coherenceDerivative > 0 && '+'}{(extensionData.coherenceDerivative * 100).toFixed(2)}%
                    </span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getCoherenceTrend() === 'improving' && 'Your coherence is improving'}
                    {getCoherenceTrend() === 'declining' && 'Your coherence needs attention'}
                    {getCoherenceTrend() === 'stable' && 'Your coherence is stable'}
                  </p>
                </div>
              </div>
              {extensionData.lastUpdate && (
                <p className="text-xs text-muted-foreground mt-4">
                  Last updated: {extensionData.lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {!extensionData.connected ? (
          <>
            {/* Installation Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Install the Chrome extension to monitor your coherence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Install from Chrome Web Store</p>
                      <p className="text-sm text-muted-foreground">
                        Download the official GCT Coherence Monitor extension
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
                      <p className="font-medium">Sign in with your account</p>
                      <p className="text-sm text-muted-foreground">
                        Use the same account you use here
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Connect to this platform</p>
                      <p className="text-sm text-muted-foreground">
                        Click connect below once the extension is installed
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={connectExtension} className="w-full">
                  <Chrome className="mr-2 h-4 w-4" />
                  Connect Extension
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Use the Extension?</CardTitle>
                <CardDescription>
                  Unlock powerful coherence monitoring features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex gap-3">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Real-time Monitoring</p>
                      <p className="text-sm text-muted-foreground">
                        Track your coherence as you browse and communicate online
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Privacy First</p>
                      <p className="text-sm text-muted-foreground">
                        Your data is encrypted and only shared with your consent
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Actionable Insights</p>
                      <p className="text-sm text-muted-foreground">
                        Get alerts when your coherence needs attention
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your coherence data is used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="shareWithCoach">Share with Coach</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your coach to see your coherence data
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="shareWithCoach"
                    checked={permissions.shareWithCoach}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, shareWithCoach: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="realTimeUpdates">Real-time Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Send live coherence updates to the platform
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="realTimeUpdates"
                    checked={permissions.realTimeUpdates}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, realTimeUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="conversationMonitoring">Conversation Analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze coherence in your online conversations
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="conversationMonitoring"
                    checked={permissions.conversationMonitoring}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, conversationMonitoring: checked }))
                    }
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Your Privacy Matters</AlertTitle>
                  <AlertDescription>
                    All data is encrypted and transmitted securely. You can delete your data at any time.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your extension connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={disconnectExtension}
                >
                  Disconnect Extension
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}