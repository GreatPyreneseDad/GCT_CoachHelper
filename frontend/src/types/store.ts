export interface Product {
  id: string;
  coachId: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  category: 'course' | 'ebook' | 'session' | 'bundle' | 'merchandise' | 'other';
  type: 'digital' | 'physical' | 'service';
  images: string[];
  featured: boolean;
  active: boolean;
  inventory?: {
    trackInventory: boolean;
    quantity: number;
    lowStockThreshold: number;
  };
  digital?: {
    downloadUrl: string;
    fileSize: string;
    fileType: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  coachId: string;
  clientId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  paymentIntentId?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StoreSettings {
  enabled: boolean;
  storeName: string;
  storeDescription: string;
  currency: string;
  taxRate: number;
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
  termsUrl?: string;
  privacyUrl?: string;
  returnPolicy?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  countries: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  enabled: boolean;
  publicKey?: string;
}