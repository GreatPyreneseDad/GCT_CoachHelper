'use client';

import { useState, useRef } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { 
  GripVertical, 
  Star, 
  Package, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  MoreVertical,
  Upload,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOptimisticList } from '@/hooks/use-optimistic-update';
import { Product } from '@/types/store';

interface DragDropProductsProps {
  products: Product[];
  onReorder: (products: Product[]) => Promise<Product[]>;
  onUpdate: (id: string, updates: Partial<Product>) => Promise<Product>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (product: Product) => void;
  className?: string;
}

function ProductCard({ 
  product, 
  onUpdate, 
  onDelete, 
  onEdit,
  isDragging 
}: { 
  product: Product;
  onUpdate: (updates: Partial<Product>) => Promise<void>;
  onDelete: () => Promise<void>;
  onEdit: () => void;
  isDragging: boolean;
}) {
  const controls = useDragControls();
  const [imageError, setImageError] = useState(false);

  const handleToggleFeatured = () => {
    onUpdate({ featured: !product.featured });
  };

  const handleToggleActive = () => {
    onUpdate({ active: !product.active });
  };

  return (
    <Reorder.Item
      value={product}
      id={product.id}
      dragListener={false}
      dragControls={controls}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "group relative",
          isDragging && "z-50"
        )}
      >
        <Card className={cn(
          "overflow-hidden transition-all",
          !product.active && "opacity-60",
          isDragging && "shadow-2xl rotate-3"
        )}>
          <CardContent className="p-0">
            <div className="flex items-stretch">
              {/* Drag Handle */}
              <div
                onPointerDown={(e) => controls.start(e)}
                className={cn(
                  "flex items-center px-2 bg-muted/50 cursor-grab",
                  "hover:bg-muted transition-colors",
                  isDragging && "cursor-grabbing"
                )}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Product Image */}
              <div className="relative w-24 h-24 bg-muted flex-shrink-0">
                {product.images?.[0] && !imageError ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-1 left-1 flex gap-1">
                  {product.featured && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold">
                        ${product.price}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {product.currency}
                        </span>
                      </span>
                      {product.inventory && (
                        <span className={cn(
                          "text-sm",
                          product.inventory.quantity <= product.inventory.lowStockThreshold 
                            ? "text-warning" 
                            : "text-muted-foreground"
                        )}>
                          {product.inventory.quantity} in stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleActive}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                      )}
                      aria-label={product.active ? "Hide product" : "Show product"}
                    >
                      {product.active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleFeatured}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                        product.featured && "text-yellow-500"
                      )}
                      aria-label={product.featured ? "Unfeature product" : "Feature product"}
                    >
                      <Star className={cn(
                        "h-4 w-4",
                        product.featured && "fill-current"
                      )} />
                    </motion.button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Reorder.Item>
  );
}

export function DragDropProducts({
  products: initialProducts,
  onReorder,
  onUpdate,
  onDelete,
  onEdit,
  className,
}: DragDropProductsProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    items: products,
    update,
    remove,
    reorder,
    isPending,
  } = useOptimisticList(initialProducts, {
    onUpdate,
    onRemove: onDelete,
    onReorder,
  });

  // File drop zone for bulk import
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(f => f.name.endsWith('.csv'));
    
    if (csvFile) {
      // Handle CSV import
      console.log('Import CSV:', csvFile.name);
      // TODO: Implement CSV parsing and import
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag and drop import zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragOver ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
          backgroundColor: isDragOver ? 'rgb(239 246 255)' : 'transparent',
        }}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop a CSV file here to bulk import products
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Or click to browse
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              console.log('Import CSV:', file.name);
              // TODO: Implement CSV parsing and import
            }
          }}
        />
      </motion.div>

      {/* Product list */}
      <Reorder.Group
        axis="y"
        values={products}
        onReorder={reorder}
        className="space-y-3"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onUpdate={(updates) => update(product.id, updates)}
            onDelete={() => remove(product.id)}
            onEdit={() => onEdit(product)}
            isDragging={draggedItem === product.id}
          />
        ))}
      </Reorder.Group>

      {products.length === 0 && (
        <Card className="p-12 text-center">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground">
              Add your first product or import from a CSV file
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading overlay */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <Card className="p-6">
            <CardContent className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Package className="h-6 w-6" />
              </motion.div>
              <span>Updating products...</span>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}