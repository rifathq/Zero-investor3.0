import { Order, OrderItem, ShippingAddress, Seller, OrderStatus, CartItem, BulkPricingTier } from '@/types/marketplace';

export interface StockReservationItem {
  productId: string;
  quantity: number;
}

export interface StockReservationResult {
  success: boolean;
  reservationId?: string;
  failedItems?: string[];
}

export const inventoryApi = {
  async reserveStock(items: StockReservationItem[], stockMap: Record<string, number>): Promise<StockReservationResult> {
    const failedItems: string[] = [];
    for (const item of items) {
      const currentStock = stockMap[item.productId] ?? 0;
      if (item.quantity > currentStock) {
        failedItems.push(item.productId);
      }
    }

    if (failedItems.length > 0) {
      return { success: false, failedItems };
    }

    return {
      success: true,
      reservationId: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
  },

  async releaseStock(_reservationId: string): Promise<boolean> {
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
  }): Promise<{ success: boolean; transactionId: string }> {
    return {
      success: true,
      transactionId: `TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
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
    shippingMethod?: 'standard' | 'express';
  }): Promise<Order> {
    const subtotal = params.cartItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const sellerIds = Array.from(new Set(params.cartItems.map(i => i.sellerId)));
    const shipping = (params.shippingMethod === 'express' ? 120 : 60) * sellerIds.length;
    const total = Math.max(0, subtotal + shipping - params.discountAmount);

    const orderId = `ORD-${Date.now()}`;
    const orderItems: OrderItem[] = params.cartItems.map(c => {
      const baseCost = c.baseCost !== undefined ? c.baseCost : c.price;
      const profitBDT = Math.max(0, c.price - baseCost) * c.quantity;
      return {
        id: `oi-${Date.now()}-${c.productId}`,
        productId: c.productId,
        productName: c.name,
        name: c.name,
        imageUrl: c.imageUrl,
        sellerId: c.sellerId,
        sellerName: c.sellerName,
        price: c.price,
        baseCost,
        profitBDT,
        quantity: c.quantity,
        subtotal: c.price * c.quantity,
        selectedColor: c.selectedColor,
        selectedSize: c.selectedSize
      };
    });

    const order: Order = {
      id: orderId,
      orderNumber: orderId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      items: orderItems,
      subtotal,
      shipping,
      discount: params.discountAmount,
      total,
      status: 'Pending' as OrderStatus,
      createdAt: new Date().toISOString(),
      shippingAddress: params.shippingAddress,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'cod' ? 'pending' : 'paid'
    };

    return order;
  }
};
