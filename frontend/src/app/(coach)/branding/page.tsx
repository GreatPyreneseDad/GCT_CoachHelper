'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Palette, 
  Globe, 
  Mail, 
  Store,
  Eye,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { BrandingConfig } from '@/types';

// Mock initial data
const initialBranding: BrandingConfig = {
  businessName: 'Transform Coaching',
  tagline: 'Unlock Your Full Potential',
  logo: '',
  primaryColor: '#2563eb',
  secondaryColor: '#7c3aed',
  fontFamily: 'Inter',
  socialMedia: {},
  emailTemplates: {},
};

export default function BrandingPage() {
  const [branding, setBranding] = useState<BrandingConfig>(initialBranding);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Branding Updated',
        description: 'Your branding changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save branding changes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding({ ...branding, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Branding & Customization</h1>
          <p className="text-muted-foreground">Customize your coaching platform appearance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {previewMode ? (
        <BrandingPreview branding={branding} />
      ) : (
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="visual">Visual Identity</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
            <TabsTrigger value="emails">Email Templates</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab branding={branding} setBranding={setBranding} />
          </TabsContent>

          <TabsContent value="visual">
            <VisualIdentityTab 
              branding={branding} 
              setBranding={setBranding}
              onLogoUpload={handleLogoUpload}
            />
          </TabsContent>

          <TabsContent value="domain">
            <DomainTab branding={branding} setBranding={setBranding} />
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplatesTab branding={branding} setBranding={setBranding} />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTab branding={branding} setBranding={setBranding} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function BasicInfoTab({ 
  branding, 
  setBranding 
}: { 
  branding: BrandingConfig;
  setBranding: (branding: BrandingConfig) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Set your business name and key information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={branding.businessName}
            onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
            placeholder="Your Coaching Business"
          />
          <p className="text-sm text-muted-foreground mt-1">
            This appears in your client portal and communications
          </p>
        </div>

        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={branding.tagline}
            onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
            placeholder="Transform lives through coaching"
            maxLength={100}
          />
          <p className="text-sm text-muted-foreground mt-1">
            A short phrase that captures your coaching philosophy
          </p>
        </div>

        <div>
          <Label>Social Media Links</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="facebook" className="text-sm">Facebook</Label>
              <Input
                id="facebook"
                value={branding.socialMedia.facebook || ''}
                onChange={(e) => setBranding({
                  ...branding,
                  socialMedia: { ...branding.socialMedia, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="instagram" className="text-sm">Instagram</Label>
              <Input
                id="instagram"
                value={branding.socialMedia.instagram || ''}
                onChange={(e) => setBranding({
                  ...branding,
                  socialMedia: { ...branding.socialMedia, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
              <Input
                id="linkedin"
                value={branding.socialMedia.linkedin || ''}
                onChange={(e) => setBranding({
                  ...branding,
                  socialMedia: { ...branding.socialMedia, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="youtube" className="text-sm">YouTube</Label>
              <Input
                id="youtube"
                value={branding.socialMedia.youtube || ''}
                onChange={(e) => setBranding({
                  ...branding,
                  socialMedia: { ...branding.socialMedia, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VisualIdentityTab({ 
  branding, 
  setBranding,
  onLogoUpload
}: { 
  branding: BrandingConfig;
  setBranding: (branding: BrandingConfig) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
    { value: 'Open Sans', label: 'Open Sans (Friendly)' },
    { value: 'Lato', label: 'Lato (Professional)' },
    { value: 'Montserrat', label: 'Montserrat (Bold)' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Identity</CardTitle>
        <CardDescription>
          Customize colors, fonts, and visual elements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative">
              {branding.logo ? (
                <img
                  src={branding.logo}
                  alt="Logo"
                  className="h-24 w-24 rounded-lg object-cover border"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={onLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 512x512px, PNG or JPG
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="primaryColor"
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="secondaryColor"
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                placeholder="#7c3aed"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="fontFamily">Font Family</Label>
          <select
            id="fontFamily"
            value={branding.fontFamily}
            onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
            className="w-full mt-2 rounded-md border border-input bg-background px-3 py-2"
          >
            {fontOptions.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Preview</h4>
          <div 
            className="space-y-2"
            style={{ fontFamily: branding.fontFamily }}
          >
            <h1 
              className="text-2xl font-bold"
              style={{ color: branding.primaryColor }}
            >
              {branding.businessName}
            </h1>
            <p style={{ color: branding.secondaryColor }}>
              {branding.tagline}
            </p>
            <div className="flex gap-2 mt-4">
              <Button 
                style={{ 
                  backgroundColor: branding.primaryColor,
                  borderColor: branding.primaryColor 
                }}
              >
                Primary Button
              </Button>
              <Button 
                variant="outline"
                style={{ 
                  color: branding.secondaryColor,
                  borderColor: branding.secondaryColor 
                }}
              >
                Secondary Button
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainTab({ 
  branding, 
  setBranding 
}: { 
  branding: BrandingConfig;
  setBranding: (branding: BrandingConfig) => void;
}) {
  const [customDomain, setCustomDomain] = useState(branding.customDomain || '');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Domain</CardTitle>
        <CardDescription>
          Use your own domain for a fully white-labeled experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Current URLs</h4>
          <div className="space-y-1 text-sm">
            <p>Platform URL: <code className="bg-background px-2 py-1 rounded">transform-coaching.gctcoachhelper.com</code></p>
            <p>Client Portal: <code className="bg-background px-2 py-1 rounded">transform-coaching.gctcoachhelper.com/client</code></p>
          </div>
        </div>

        <div>
          <Label htmlFor="customDomain">Custom Domain</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="customDomain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="coaching.yourdomain.com"
              className="flex-1"
            />
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
        </div>

        {customDomain && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">DNS Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Add the following CNAME record to your domain's DNS settings:
            </p>
            <div className="bg-muted p-3 rounded font-mono text-sm">
              <p>Type: CNAME</p>
              <p>Name: {customDomain.split('.')[0]}</p>
              <p>Value: transform-coaching.gctcoachhelper.com</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">Verify DNS</Button>
              <span className="text-sm text-muted-foreground">
                Status: {verificationStatus === 'verified' ? '✅ Verified' : '⏳ Pending verification'}
              </span>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">SSL Certificate</h4>
          <p className="text-sm text-muted-foreground mb-3">
            SSL certificates are automatically provisioned for custom domains
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>SSL Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailTemplatesTab({ 
  branding, 
  setBranding 
}: { 
  branding: BrandingConfig;
  setBranding: (branding: BrandingConfig) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<'welcome' | 'sessionReminder' | 'progressUpdate'>('welcome');

  const templates = {
    welcome: {
      title: 'Welcome Email',
      description: 'Sent when a new client joins your coaching program',
      variables: ['{{clientName}}', '{{coachName}}', '{{portalLink}}']
    },
    sessionReminder: {
      title: 'Session Reminder',
      description: 'Sent 24 hours before a scheduled session',
      variables: ['{{clientName}}', '{{sessionDate}}', '{{sessionTime}}', '{{sessionLink}}']
    },
    progressUpdate: {
      title: 'Progress Update',
      description: 'Monthly progress report for clients',
      variables: ['{{clientName}}', '{{coherenceScore}}', '{{improvements}}', '{{nextSteps}}']
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>
          Customize automated emails sent to your clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(templates).map(([key, template]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-colors ${
                selectedTemplate === key ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(key as any)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-base">{template.title}</CardTitle>
                <CardDescription className="text-xs">
                  {template.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="emailSubject">Subject Line</Label>
            <Input
              id="emailSubject"
              placeholder={`Welcome to ${branding.businessName}, {{clientName}}!`}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="emailContent">Email Content</Label>
            <Textarea
              id="emailContent"
              rows={10}
              className="mt-2 font-mono text-sm"
              placeholder="Hi {{clientName}},

Welcome to your coaching journey with {{coachName}}!

We're excited to support you in achieving your goals..."
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Available Variables</h4>
            <div className="flex flex-wrap gap-2">
              {templates[selectedTemplate].variables.map(variable => (
                <code key={variable} className="bg-background px-2 py-1 rounded text-xs">
                  {variable}
                </code>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send Test Email
            </Button>
            <Button>Save Template</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdvancedTab({ 
  branding, 
  setBranding 
}: { 
  branding: BrandingConfig;
  setBranding: (branding: BrandingConfig) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>White Label Settings</CardTitle>
          <CardDescription>
            Remove platform branding for a fully custom experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Remove "Powered by GCT CoachHelper"</Label>
              <p className="text-sm text-muted-foreground">
                Hide platform branding from client-facing pages
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Custom Email Domain</Label>
              <p className="text-sm text-muted-foreground">
                Send emails from your own domain
              </p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Web Store Settings</CardTitle>
          <CardDescription>
            Enable e-commerce features for your coaching business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Web Store</Label>
              <p className="text-sm text-muted-foreground">
                Sell digital products, courses, and coaching packages
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Payment Gateway</Label>
              <p className="text-sm text-muted-foreground">
                Stripe integration for secure payments
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Store className="mr-2 h-4 w-4" />
              Configure Stripe
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom CSS</CardTitle>
          <CardDescription>
            Advanced styling with custom CSS (Professional plan and above)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={8}
            className="font-mono text-sm"
            placeholder="/* Custom CSS */
.client-portal {
  /* Your custom styles */
}"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function BrandingPreview({ branding }: { branding: BrandingConfig }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Portal Preview</CardTitle>
          <CardDescription>
            This is how your clients will see their portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-6 space-y-4"
            style={{ fontFamily: branding.fontFamily }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="h-10 w-10 rounded" />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded"></div>
                )}
                <div>
                  <h1 
                    className="text-xl font-bold"
                    style={{ color: branding.primaryColor }}
                  >
                    {branding.businessName}
                  </h1>
                  {branding.tagline && (
                    <p className="text-sm text-muted-foreground">{branding.tagline}</p>
                  )}
                </div>
              </div>
              <Button 
                size="sm"
                style={{ 
                  backgroundColor: branding.primaryColor,
                  borderColor: branding.primaryColor 
                }}
              >
                Book Session
              </Button>
            </div>

            {/* Welcome Section */}
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-2">Welcome back, Sarah!</h2>
              <p className="text-muted-foreground">
                Your coherence score has improved by 12% this month. Keep up the great work!
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-3 gap-4">
              {['Take Assessment', 'View Progress', 'Resources'].map((action) => (
                <Card key={action} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div 
                      className="h-12 w-12 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: `${branding.secondaryColor}20` }}
                    ></div>
                    <p className="font-medium">{action}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}