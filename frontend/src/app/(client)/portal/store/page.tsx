'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  ShoppingCart,
  Filter,
  Package,
  Star,
  Clock,
  Download,
  Video,
  BookOpen,
  Users,
  TrendingUp
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

// Mock coach branding
const coachBranding = {
  businessName: "Transform Your Life Coaching",
  primaryColor: "#3B82F6",
  logo: "/coach-logo.png",
};

// Mock products
const mockProducts: Product[] = [
  {
    id: '1',
    coachId: 'coach-1',
    name: 'Coherence Mastery Course',
    description: 'Master all four dimensions of coherence in this comprehensive 8-week journey. Transform your internal consistency, accumulated wisdom, moral activation, and social belonging.',
    shortDescription: '8-week comprehensive coherence training',
    price: 497,
    currency: 'USD',
    category: 'course',
    type: 'digital',
    images: ['/placeholder-course.jpg'],
    featured: true,
    active: true,
    tags: ['course', 'coherence', 'transformation', 'bestseller'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: '2',
    coachId: 'coach-1',
    name: 'Daily Coherence Journal',
    description: 'Track your coherence journey with this beautifully designed journal. Includes prompts for all four dimensions and space for daily reflections.',
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
    description: 'Three intensive 90-minute sessions designed to create major breakthroughs in your coherence journey. Includes personalized action plans.',
    shortDescription: '3x 90-minute breakthrough sessions',
    price: 750,
    currency: 'USD',
    category: 'bundle',
    type: 'service',
    images: ['/placeholder-session.jpg'],
    featured: true,
    active: true,
    tags: ['session', 'bundle', 'breakthrough', 'popular'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: '4',
    coachId: 'coach-1',
    name: 'Finding Your Inner Compass (E-book)',
    description: 'A comprehensive guide to discovering and aligning with your authentic self through the lens of Grounded Coherence Theory.',
    shortDescription: 'E-book on authentic self-discovery',
    price: 19.99,
    currency: 'USD',
    category: 'ebook',
    type: 'digital',
    images: ['/placeholder-ebook.jpg'],
    featured: false,
    active: true,
    digital: {
      downloadUrl: '#',
      fileSize: '2.5MB',
      fileType: 'PDF',
    },
    tags: ['ebook', 'self-discovery', 'digital'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-15'),
  },
];

// Mock cart count
const cartItemCount = 2;

export default function ClientStorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  const filteredProducts = mockProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.active;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course':
        return <Video className="h-4 w-4" />;
      case 'ebook':
        return <BookOpen className="h-4 w-4" />;
      case 'session':
        return <Users className="h-4 w-4" />;
      case 'bundle':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{coachBranding.businessName} Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover resources and tools to accelerate your transformation journey
          </p>
        </div>
      </div>

      {/* Store Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
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
                  <Video className="mr-2 h-4 w-4" />
                  Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('ebook')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  E-books
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('session')}>
                  <Users className="mr-2 h-4 w-4" />
                  Sessions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('bundle')}>
                  <Package className="mr-2 h-4 w-4" />
                  Bundles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('merchandise')}>
                  <Package className="mr-2 h-4 w-4" />
                  Merchandise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('featured')}>
                  Featured
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-low')}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-high')}>
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => router.push('/portal/store/cart')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart ({cartItemCount})
            </Button>
          </div>
        </div>

        {/* Featured Products */}
        {filteredProducts.filter(p => p.featured).length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.filter(p => p.featured).map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getCategoryIcon(product.category)}
                    </div>
                    {product.tags.includes('bestseller') && (
                      <Badge className="absolute top-4 right-4">Bestseller</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {product.shortDescription}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {getCategoryIcon(product.category)}
                        <span className="ml-1 capitalize">{product.category}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          ${product.price}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {product.currency}
                          </span>
                        </p>
                      </div>
                      <Button onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Products Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  {product.type === 'digital' && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      <Download className="mr-1 h-3 w-3" />
                      Digital
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {product.inventory && (
                    <p className={cn(
                      "text-sm mb-2",
                      product.inventory.quantity <= product.inventory.lowStockThreshold
                        ? "text-warning font-medium"
                        : "text-muted-foreground"
                    )}>
                      {product.inventory.quantity <= product.inventory.lowStockThreshold
                        ? `Only ${product.inventory.quantity} left!`
                        : 'In stock'}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">
                      ${product.price}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/portal/store/products/${product.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add
                      </Button>
                    </div>
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
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 py-8 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Secure Checkout</p>
              <p className="text-sm text-muted-foreground">SSL encrypted</p>
            </div>
            <div>
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Instant Access</p>
              <p className="text-sm text-muted-foreground">Digital products</p>
            </div>
            <div>
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Proven Results</p>
              <p className="text-sm text-muted-foreground">1000+ clients</p>
            </div>
            <div>
              <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">5-Star Reviews</p>
              <p className="text-sm text-muted-foreground">98% satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}