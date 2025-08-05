'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Save,
  Package,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Settings,
  Tag,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [productData, setProductData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    currency: 'USD',
    category: '',
    type: 'digital',
    featured: false,
    active: true,
    trackInventory: false,
    quantity: '',
    lowStockThreshold: '10',
    tags: [] as string[],
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!productData.name) newErrors.name = 'Product name is required';
    if (!productData.shortDescription) newErrors.shortDescription = 'Short description is required';
    if (!productData.description) newErrors.description = 'Description is required';
    if (!productData.price || parseFloat(productData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!productData.category) newErrors.category = 'Category is required';
    
    if (productData.type === 'physical' && productData.trackInventory) {
      if (!productData.quantity || parseInt(productData.quantity) < 0) {
        newErrors.quantity = 'Valid quantity is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: API call to create product
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Product created!',
        description: 'Your product has been added to the store.',
      });
      
      router.push('/store');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag && !productData.tags.includes(currentTag)) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.toLowerCase()],
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
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
          <h1 className="text-3xl font-bold">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your store
          </p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Basic details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productData.name}
                    onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Coherence Mastery Course"
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Input
                    id="shortDescription"
                    value={productData.shortDescription}
                    onChange={(e) => setProductData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Brief description for product cards"
                    maxLength={100}
                    className={cn(errors.shortDescription && "border-destructive")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {productData.shortDescription.length}/100 characters
                  </p>
                  {errors.shortDescription && (
                    <p className="text-sm text-destructive mt-1">{errors.shortDescription}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed product description..."
                    rows={6}
                    className={cn(errors.description && "border-destructive")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={productData.category}
                      onValueChange={(value) => setProductData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category" className={cn(errors.category && "border-destructive")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="session">Session</SelectItem>
                        <SelectItem value="bundle">Bundle</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="type">Product Type *</Label>
                    <Select
                      value={productData.type}
                      onValueChange={(value) => setProductData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>
                  Set your product pricing and manage inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productData.price}
                        onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        className={cn("pl-10", errors.price && "border-destructive")}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-destructive mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={productData.currency}
                      onValueChange={(value) => setProductData(prev => ({ ...prev, currency: value }))}
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
                </div>

                {productData.type === 'physical' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="trackInventory">Track Inventory</Label>
                        <p className="text-sm text-muted-foreground">
                          Monitor stock levels for this product
                        </p>
                      </div>
                      <Switch
                        id="trackInventory"
                        checked={productData.trackInventory}
                        onCheckedChange={(checked) => setProductData(prev => ({ ...prev, trackInventory: checked }))}
                      />
                    </div>

                    {productData.trackInventory && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quantity">Initial Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={productData.quantity}
                            onChange={(e) => setProductData(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder="0"
                            className={cn(errors.quantity && "border-destructive")}
                          />
                          {errors.quantity && (
                            <p className="text-sm text-destructive mt-1">{errors.quantity}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lowStock">Low Stock Alert</Label>
                          <Input
                            id="lowStock"
                            type="number"
                            value={productData.lowStockThreshold}
                            onChange={(e) => setProductData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                            placeholder="10"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Alert when stock falls below this level
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Product Media</CardTitle>
                <CardDescription>
                  Upload images for your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop or click to browse
                  </p>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>
                  Additional options and tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured">Featured Product</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this product prominently in your store
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={productData.featured}
                    onCheckedChange={(checked) => setProductData(prev => ({ ...prev, featured: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this product available for purchase
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={productData.active}
                    onCheckedChange={(checked) => setProductData(prev => ({ ...prev, active: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tags help customers find your products
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Save as draft
                toast({
                  title: 'Saved as draft',
                  description: 'You can continue editing later.',
                });
              }}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}