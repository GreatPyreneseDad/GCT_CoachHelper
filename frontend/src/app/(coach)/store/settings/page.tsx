'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Save,
  Store,
  CreditCard,
  Truck,
  FileText,
  Shield,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import { StoreSettings, ShippingOption } from '@/types/store';

// Mock data
const mockSettings: StoreSettings = {
  enabled: true,
  storeName: 'Transform Your Life Store',
  storeDescription: 'Premium coaching resources and tools for personal transformation',
  currency: 'USD',
  taxRate: 8.5,
  shippingOptions: [
    {
      id: '1',
      name: 'Standard Shipping',
      description: '5-7 business days',
      price: 5.99,
      estimatedDays: '5-7',
      countries: ['US', 'CA'],
    },
    {
      id: '2',
      name: 'Express Shipping',
      description: '2-3 business days',
      price: 14.99,
      estimatedDays: '2-3',
      countries: ['US'],
    },
  ],
  paymentMethods: [
    { id: 'stripe', type: 'stripe', enabled: true },
    { id: 'paypal', type: 'paypal', enabled: false },
    { id: 'apple_pay', type: 'apple_pay', enabled: true },
    { id: 'google_pay', type: 'google_pay', enabled: true },
  ],
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  returnPolicy: '30-day money-back guarantee on all digital products',
};

export default function StoreSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState(mockSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      // TODO: API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Settings saved',
        description: 'Your store settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addShippingOption = () => {
    const newOption: ShippingOption = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      estimatedDays: '',
      countries: [],
    };
    setSettings(prev => ({
      ...prev,
      shippingOptions: [...prev.shippingOptions, newOption],
    }));
  };

  const removeShippingOption = (id: string) => {
    setSettings(prev => ({
      ...prev,
      shippingOptions: prev.shippingOptions.filter(opt => opt.id !== id),
    }));
  };

  const updateShippingOption = (id: string, field: keyof ShippingOption, value: any) => {
    setSettings(prev => ({
      ...prev,
      shippingOptions: prev.shippingOptions.map(opt =>
        opt.id === id ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Store Settings</h1>
          <p className="text-muted-foreground">
            Configure your store preferences and policies
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic settings for your online store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Store Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to browse and purchase products
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, storeName: e.target.value }))
                  }
                  placeholder="Your Store Name"
                />
              </div>

              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={settings.storeDescription}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, storeDescription: e.target.value }))
                  }
                  placeholder="Brief description of your store..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This appears on your store homepage
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure accepted payment options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Payment processing requires additional setup with each provider
                </AlertDescription>
              </Alert>

              {settings.paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">{method.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.type === 'stripe' && 'Accept all major credit cards'}
                        {method.type === 'paypal' && 'PayPal checkout'}
                        {method.type === 'apple_pay' && 'Fast checkout for Apple users'}
                        {method.type === 'google_pay' && 'Fast checkout for Android users'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.enabled ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          paymentMethods: prev.paymentMethods.map(m =>
                            m.id === method.id ? { ...m, enabled: checked } : m
                          ),
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shipping Options</CardTitle>
                  <CardDescription>
                    Set up shipping methods for physical products
                  </CardDescription>
                </div>
                <Button onClick={addShippingOption} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.shippingOptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shipping options configured</p>
                  <p className="text-sm">Add shipping options for physical products</p>
                </div>
              ) : (
                settings.shippingOptions.map((option) => (
                  <div key={option.id} className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={option.name}
                          onChange={(e) => updateShippingOption(option.id, 'name', e.target.value)}
                          placeholder="e.g., Standard Shipping"
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            value={option.price}
                            onChange={(e) => updateShippingOption(option.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={option.description}
                          onChange={(e) => updateShippingOption(option.id, 'description', e.target.value)}
                          placeholder="e.g., 5-7 business days"
                        />
                      </div>
                      <div>
                        <Label>Estimated Days</Label>
                        <Input
                          value={option.estimatedDays}
                          onChange={(e) => updateShippingOption(option.id, 'estimatedDays', e.target.value)}
                          placeholder="e.g., 5-7"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShippingOption(option.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Store Policies</CardTitle>
              <CardDescription>
                Legal and customer service policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="termsUrl">Terms of Service URL</Label>
                <Input
                  id="termsUrl"
                  value={settings.termsUrl || ''}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, termsUrl: e.target.value }))
                  }
                  placeholder="/terms"
                />
              </div>

              <div>
                <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                <Input
                  id="privacyUrl"
                  value={settings.privacyUrl || ''}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, privacyUrl: e.target.value }))
                  }
                  placeholder="/privacy"
                />
              </div>

              <div>
                <Label htmlFor="returnPolicy">Return/Refund Policy</Label>
                <Textarea
                  id="returnPolicy"
                  value={settings.returnPolicy || ''}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, returnPolicy: e.target.value }))
                  }
                  placeholder="Describe your return and refund policy..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be displayed to customers during checkout
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}