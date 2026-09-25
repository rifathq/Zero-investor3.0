export type UserRole = 'customer' | 'seller' | 'reseller' | 'admin';

export interface UserProfile {
  id?: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  status?: 'active' | 'suspended' | 'pending';
  resellerStatus?: 'verified' | 'pending' | 'rejected' | 'active' | string;
  isVerified?: boolean;
  isVerifiedReseller?: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatarUrl?: string;
  photoURL?: string;
  sellerStoreId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkPricingTier {
  minQuantity: number;
  discountPercent: number;
  unitPrice?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stockCount?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  brand?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  additionalImages?: string[];
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  sellerLocation?: string;
  isTrending?: boolean;
  isDeal?: boolean;
  isRecommended?: boolean;
  isNewArrival?: boolean;
  inStock: boolean;
  stockCount: number;
  bulkPricingEnabled?: boolean;
  bulkPricingTiers?: BulkPricingTier[];
  description: string;
  features?: string[];
  benefits?: string[];
  specifications?: Record<string, string>;
  supplierPrice?: number;
  suggestedPrice?: number;
  resellerProfit?: number;
  isActive?: boolean;
  targetAudience?: string;
  marketingAngles?: string[];
  colors?: string[];
  sizes?: string[];
  variants?: ProductVariant[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  icon?: string;
  imageUrl: string;
  productCount: number;
  description: string;
  subcategories?: string[];
  status?: 'active' | 'hidden';
  isFeatured?: boolean;
  sortOrder?: number;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Seller {
  id: string;
  storeName: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  followersCount: number;
  productCount: number;
  salesCount: number;
  location: string;
  joinedDate: string;
  avatarUrl: string;
  bannerUrl: string;
  isVerified: boolean;
  isFeatured: boolean;
  status: 'active' | 'suspended' | 'pending';
  commissionRate: number;
  contactEmail: string;
  phone: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category?: string;
  price: number;
  baseCost?: number;
  originalPrice?: number;
  standardPrice?: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  maxStock: number;
  selectedColor?: string;
  selectedSize?: string;
  variantId?: string;
  variantName?: string;
  sku?: string;
  bulkTierApplied?: BulkPricingTier | null;
}

export interface SellerCartGroup {
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  sellerLocation?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  itemCount: number;
  qualifiesFreeShipping: boolean;
  estimatedShippingFee: number;
  freeShippingThreshold: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  name?: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  price: number;
  baseCost?: number;
  profitBDT?: number;
  quantity: number;
  subtotal?: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface SellerOrder {
  id: string;
  subOrderNumber: string;
  parentOrderId: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  commissionRate: number;
  commissionAmount: number;
  sellerEarnings: number;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  carrier?: string;
  updatedAt?: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subOrders?: SellerOrder[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus | string;
  createdAt: string;
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'cod' | 'mobile_money' | string;
  paymentStatus?: 'pending' | 'authorized' | 'paid' | 'failed';
  trackingNumber?: string;
  carrier?: string;
  courier?: string;
  customerPhone?: string;
  customerCity?: string;
  resellerId?: string;
  storeName?: string;
  storeSlug?: string;
  resellerName?: string;
  profitBDT?: number;
  totalAmountBDT?: number;
  isSettled?: boolean;
  deliveryDate?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minPurchase: number;
  description: string;
  expiresAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  userId?: string;
  userEmail?: string;
  orderId?: string;
  orderNumber?: string;
  helpfulCount?: number;
  recommended?: boolean;
}

export type ActiveView = 
  | 'home' 
  | 'auth'
  | 'search'
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'sellers' 
  | 'seller-store' 
  | 'account' 
  | 'seller-dashboard' 
  | 'admin-dashboard' 
  | 'deals' 
  | 'order-tracking' 
  | 'track-order'
  | 'how-it-works'
  | 'categories'
  | 'new-arrivals'
  | 'about' 
  | 'help'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'verify-email'
  | 'email-verification'
  | 'phone-auth'
  | 'customer-account'
  | 'contact'
  | 'reseller'
  | 'start-selling'
  | 'reseller-login'
  | 'reseller-register'
  | 'reseller-packages'
  | 'reseller-dashboard'
  | 'reseller-portal'
  | 'reseller-public-store'
  | 'reseller-public-landing'
  | 'access-denied';
