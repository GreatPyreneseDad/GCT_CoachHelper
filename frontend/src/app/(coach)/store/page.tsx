'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Store,
  Package,
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  BarChart3,
  Users,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types/store';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    coachId: 'coach-1',
    name: 'Coherence Mastery Course',
    description: 'A comprehensive 8-week course on mastering all four dimensions of coherence',
    shortDescription: '8-week comprehensive coherence training',
    price: 497,
    currency: 'USD',
    category: 'course',
    type: 'digital',
    images: ['/placeholder-course.jpg'],
    featured: true,
    active: true,
    tags: ['course', 'coherence', 'transformation'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: '2',
    coachId: 'coach-1',
    name: 'Daily Coherence Journal',
    description: 'A beautifully designed journal for tracking your coherence journey',
    shortDescription: 'Track your daily coherence progress',
    price: 29.99,
    currency: 'USD',
    category: 'merchandise',
    type: 'physical',
    images: ['/placeholder-journal.jpg'],
    featured: false,
    active: true,
    inventory: {
      trackInventory: true,
      quantity: 45,
      lowStockThreshold: 10,
    },
    tags: ['journal', 'tracking', 'physical'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: '3',
    coachId: 'coach-1',
    name: 'Breakthrough Session Bundle',
    description: '3 intensive 90-minute sessions for major breakthroughs',
    shortDescription: '3x 90-minute breakthrough sessions',
    price: 750,
    currency: 'USD',
    category: 'bundle',
    type: 'service',
    images: ['/placeholder-session.jpg'],
    featured: true,
    active: true,
    tags: ['session', 'bundle', 'breakthrough'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-18'),
  },
];

const mockStats = {
  totalRevenue: 12847.50,
  totalOrders: 47,
  activeProducts: 8,
  conversionRate: 3.2,
};

export default function StorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: 'Product deleted',
      description: 'The product has been removed from your store.',
    });
  };

  const handleToggleActive = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, active: !p.active } : p
    ));
    const product = products.find(p => p.id === productId);
    toast({
      title: product?.active ? 'Product deactivated' : 'Product activated',
      description: product?.active 
        ? 'This product is no longer available for purchase.'
        : 'This product is now available for purchase.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground">
            Manage your products and track sales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/store/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => router.push('/store/products/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ShoppingCart className="inline h-3 w-3 mr-1" />
              5 pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Package className="inline h-3 w-3 mr-1" />
              2 out of stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <BarChart3 className="inline h-3 w-3 mr-1" />
              Industry avg: 2.5%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Tab */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory('course')}>
                  Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('ebook')}>
                  E-books
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('session')}>
                  Sessions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('bundle')}>
                  Bundles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('merchandise')}>
                  Merchandise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={cn(!product.active && "opacity-60")}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {product.shortDescription}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/store/products/${product.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/store/products/${product.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(product.id)}>
                          {product.active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        ${product.price}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {product.currency}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {product.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {product.inventory && (
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4" />
                      <span className={cn(
                        product.inventory.quantity <= product.inventory.lowStockThreshold && "text-warning"
                      )}>
                        {product.inventory.quantity} in stock
                      </span>
                      {product.inventory.quantity <= product.inventory.lowStockThreshold && (
                        <Badge variant="outline" className="text-warning border-warning">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="p-12 text-center">
              <CardContent>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first product'}
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <Button onClick={() => router.push('/store/products/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Orders coming soon</h3>
              <p className="text-muted-foreground">
                View and manage customer orders
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics coming soon</h3>
              <p className="text-muted-foreground">
                Track your store performance and customer insights
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}