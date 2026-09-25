import { 
  CartItem, 
  Product, 
  Seller, 
  Coupon, 
  Order, 
  SellerOrder, 
  OrderItem, 
  ShippingAddress, 
  BulkPricingTier,
  OrderStatus,
  SellerCartGroup
} from '@/types/marketplace';

export * from './authService';
export * from './backendApi';
export type { SellerCartGroup } from '@/types/marketplace';

export interface CartCalculationResult {
  sellerGroups: Record<string, SellerCartGroup>;
  grossSubtotal: number;
  bulkSavingsTotal: number;
  totalShipping: number;
  discountAmount: number;
  finalTotal: number;
  totalItemsCount: number;
}

export const cartApi = {
  calculateEffectiveUnitPrice(product: Product, quantity: number): { unitPrice: number; bulkTierApplied: BulkPricingTier | null } {
    let bestUnitPrice = product.price;
    let appliedTier: BulkPricingTier | null = null;

    if (product.bulkPricingEnabled && product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
      const sortedTiers = [...product.bulkPricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const tier of sortedTiers) {
        if (quantity >= tier.minQuantity) {
          appliedTier = tier;
          if (tier.unitPrice !== undefined) {
            bestUnitPrice = tier.unitPrice;
          } else {
            bestUnitPrice = Math.round(product.price * (1 - tier.discountPercent / 100));
          }
          break;
        }
      }
    }

    return {
      unitPrice: bestUnitPrice,
      bulkTierApplied: appliedTier
    };
  },

  calculateMarketplaceTotals(
    cart: CartItem[], 
    sellers: Seller[], 
    appliedCoupon: Coupon | null, 
    shippingMethod: string = 'standard'
  ): CartCalculationResult {
    const groups: Record<string, SellerCartGroup> = {};
    let grossSubtotal = 0;
    let bulkSavingsTotal = 0;
    let totalItemsCount = 0;

    cart.forEach(item => {
      totalItemsCount += item.quantity;
      const originalPrice = item.originalPrice || item.price;
      const currentItemSubtotal = Math.round(item.price * item.quantity);
      grossSubtotal += currentItemSubtotal;

      if (originalPrice > item.price) {
        bulkSavingsTotal += Math.round((originalPrice - item.price) * item.quantity);
      }

      if (!groups[item.sellerId]) {
        const seller = sellers.find(s => s.id === item.sellerId);
        groups[item.sellerId] = {
          sellerId: item.sellerId,
          sellerName: item.sellerName || seller?.storeName || 'Artisan Seller',
          sellerRating: seller?.rating,
          sellerLocation: seller?.location,
          items: [],
          subtotal: 0,
          shippingFee: 0,
          itemCount: 0,
          qualifiesFreeShipping: false,
          estimatedShippingFee: 60,
          freeShippingThreshold: 1000
        };
      }

      const group = groups[item.sellerId];
      group.items.push(item);
      group.subtotal += currentItemSubtotal;
      group.itemCount += item.quantity;
    });

    let totalShipping = 0;
    Object.values(groups).forEach(group => {
      const qualifies = (shippingMethod !== 'express' && group.subtotal >= 1000);
      const fee = shippingMethod === 'express' ? 120 : (qualifies ? 0 : 60);
      group.qualifiesFreeShipping = qualifies;
      group.estimatedShippingFee = fee;
      group.shippingFee = fee;
      totalShipping += fee;
    });

    // Coupon discount
    let discountAmount = 0;
    if (appliedCoupon && grossSubtotal >= appliedCoupon.minPurchase) {
      discountAmount = Math.round((grossSubtotal * appliedCoupon.discountPercent) / 100);
    }

    const finalTotal = Math.max(0, Math.round(grossSubtotal - discountAmount + totalShipping));

    return {
      sellerGroups: groups,
      grossSubtotal: Math.round(grossSubtotal),
      bulkSavingsTotal: Math.round(bulkSavingsTotal),
      totalShipping: Math.round(totalShipping),
      discountAmount,
      finalTotal,
      totalItemsCount
    };
  },

  async validateCoupon(code: string, subtotal: number, coupons: Coupon[]): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmed);
    if (!found) {
      return { valid: false, error: `Coupon code "${code}" is invalid or expired.` };
    }
    if (subtotal < found.minPurchase) {
      return { 
        valid: false, 
        error: `Minimum order of ৳${found.minPurchase.toLocaleString('en-US')} required for "${found.code}".` 
      };
    }
    return { valid: true, coupon: found };
  }
};

export const inventoryApi = {
  async reserveStock(
    items: Array<{ productId: string; variantId?: string; quantity: number }>,
    stockMap: Record<string, number>
  ): Promise<{ success: boolean; reservationId?: string }> {
    for (const item of items) {
      const stock = stockMap[item.productId];
      if (stock !== undefined && stock < item.quantity) {
        return { success: false };
      }
    }
    return {
      success: true,
      reservationId: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };
  },

  async releaseStock(reservationId: string): Promise<boolean> {
    return true;
  }
};

export const paymentApi = {
  async createPaymentIntent(params: {
    orderNumber: string;
    amount: number;
    currency: string;
    method: string;
    mobileProvider?: string;
    customerEmail: string;
  }): Promise<{ success: boolean; intentId: string }> {
    return {
      success: true,
      intentId: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    };
  }
};

export const orderApi = {
  async createMarketplaceOrder(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    cartItems: CartItem[];
    sellers: Seller[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    discountAmount: number;
    appliedCouponCode?: string;
    shippingMethod: string;
  }): Promise<Order> {
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `ZI-${Math.floor(1000 + Math.random() * 9000)}`;

    const { sellerGroups, grossSubtotal, totalShipping, finalTotal } = cartApi.calculateMarketplaceTotals(
      params.cartItems,
      params.sellers,
      null,
      params.shippingMethod
    );

    const subOrders: SellerOrder[] = Object.values(sellerGroups).map((group, idx) => {
      const charCode = String.fromCharCode(65 + idx);
      const subOrderNumber = `${orderNumber}-${charCode}`;
      const seller = params.sellers.find(s => s.id === group.sellerId);
      const commRate = seller?.commissionRate || 8.0;
      const commAmount = Math.round((group.subtotal * commRate) / 100);

      const items: OrderItem[] = group.items.map(it => ({
        id: it.id,
        productId: it.productId,
        productName: it.name,
        name: it.name,
        imageUrl: it.imageUrl,
        sellerId: it.sellerId,
        sellerName: it.sellerName,
        price: it.price,
        quantity: it.quantity,
        subtotal: Math.round(it.price * it.quantity),
        selectedColor: it.selectedColor,
        selectedSize: it.selectedSize
      }));

      return {
        id: `sub-${orderId}-${idx + 1}`,
        subOrderNumber,
        parentOrderId: orderId,
        sellerId: group.sellerId,
        sellerName: group.sellerName,
        items,
        subtotal: group.subtotal,
        shippingFee: group.shippingFee,
        commissionRate: commRate,
        commissionAmount: commAmount,
        sellerEarnings: group.subtotal - commAmount,
        status: 'Processing' as OrderStatus,
        trackingNumber: `TRK-${group.sellerName.replace(/\s+/g, '').slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        estimatedDelivery: '3 - 5 business days',
        carrier: 'Artisan Express'
      };
    });

    const masterItems: OrderItem[] = params.cartItems.map(it => ({
      id: it.id,
      productId: it.productId,
      productName: it.name,
      name: it.name,
      imageUrl: it.imageUrl,
      sellerId: it.sellerId,
      sellerName: it.sellerName,
      price: it.price,
      quantity: it.quantity,
      subtotal: it.price * it.quantity,
      selectedColor: it.selectedColor,
      selectedSize: it.selectedSize
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      items: masterItems,
      subOrders,
      subtotal: grossSubtotal,
      shipping: totalShipping,
      discount: params.discountAmount,
      total: finalTotal,
      status: 'Processing' as OrderStatus,
      createdAt: new Date().toISOString().split('T')[0],
      shippingAddress: params.shippingAddress,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
      trackingNumber: subOrders[0]?.trackingNumber,
      carrier: 'Zero Invest Multi-Carrier',
      deliveryDate: '3-5 Business Days'
    };

    return newOrder;
  },

  async trackOrder(query: string, orders: Order[]): Promise<{ order: Order; matchedSubOrder?: SellerOrder } | null> {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    for (const order of orders) {
      if (order.orderNumber.toLowerCase() === q || order.id.toLowerCase() === q) {
        return { order, matchedSubOrder: order.subOrders?.[0] };
      }
      if (order.trackingNumber && order.trackingNumber.toLowerCase() === q) {
        return { order, matchedSubOrder: order.subOrders?.[0] };
      }
      if (order.subOrders) {
        for (const sub of order.subOrders) {
          if (sub.subOrderNumber.toLowerCase() === q || sub.id.toLowerCase() === q) {
            return { order, matchedSubOrder: sub };
          }
          if (sub.trackingNumber && sub.trackingNumber.toLowerCase() === q) {
            return { order, matchedSubOrder: sub };
          }
        }
      }
    }
    return null;
  }
};

export const productApi = {
  filterProducts(products: Product[], options: {
    category?: string | null;
    subcategory?: string | null;
    searchQuery?: string;
    sellerId?: string | null;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
  }): Product[] {
    return products.filter(p => {
      if (options.category && p.category.toLowerCase() !== options.category.toLowerCase()) {
        return false;
      }
      if (options.subcategory && p.subcategory?.toLowerCase() !== options.subcategory.toLowerCase()) {
        return false;
      }
      if (options.sellerId && p.sellerId !== options.sellerId) {
        return false;
      }
      if (options.minPrice !== undefined && p.price < options.minPrice) {
        return false;
      }
      if (options.maxPrice !== undefined && p.price > options.maxPrice) {
        return false;
      }
      if (options.inStockOnly && (!p.inStock || p.stockCount <= 0)) {
        return false;
      }
      if (options.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSeller = p.sellerName.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesSeller && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }
};

export const shippingApi = {
  calculateShipping(sellerGroupsCount: number, method: 'standard' | 'express' = 'standard'): number {
    const ratePerSeller = method === 'express' ? 9.99 : 4.99;
    return sellerGroupsCount * ratePerSeller;
  }
};
