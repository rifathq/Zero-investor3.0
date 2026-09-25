import { ResellerPlan, ResellerNotification } from '@/types/reseller';
import { Order } from '@/types/marketplace';

export type { ResellerPlan };

export const RESELLER_PLANS: ResellerPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceBDT: 0,
    billingPeriod: 'Free Forever',
    description: 'Perfect for beginners starting their online reseller journey with zero upfront capital.',
    ctaText: 'Get Started Free',
    features: [
      'Access to wholesale catalog',
      'Up to 10 active product listings',
      'Standard courier dispatch & COD',
      'Automated weekly profit payouts',
      'Community support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Partner',
    priceBDT: 999,
    billingPeriod: 'Monthly',
    description: 'For ambitious resellers scaling their business with branded storefronts and high-converting landing pages.',
    badge: 'Most Popular',
    ctaText: 'Upgrade to Pro',
    features: [
      'Unlimited product catalog access',
      'Unlimited standalone landing pages',
      'Priority delivery dispatch via Steadfast/Pathao',
      'Custom storefront sub-domain & branding',
      'Instant 24-hour wallet withdrawals',
      'Dedicated account manager'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise VIP',
    priceBDT: 2499,
    billingPeriod: 'Monthly',
    description: 'For power sellers, agencies, and high-volume merchant teams needing custom workflows and zero commission cuts.',
    badge: 'Enterprise',
    ctaText: 'Contact VIP Sales',
    features: [
      'Everything in Pro Partner',
      'Lowest bulk wholesale pricing tiers',
      'Custom domain connection (CNAME)',
      'Direct supplier contact & custom sourcing',
      'Zero platform transaction fees',
      '24/7 VIP hotline & priority logistics'
    ]
  }
];

export const INITIAL_RESELLER_ORDERS: (Order & { profitBDT?: number; courier?: string })[] = [
  {
    id: 'ord-res-101',
    orderNumber: 'ORD-10492',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-101',
    customerName: 'Tanvir Ahmed',
    customerEmail: 'tanvir.ahmed@example.com',
    customerPhone: '+8801712345678',
    customerCity: 'Dhaka',
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    courier: 'Pathao Courier',
    trackingNumber: 'PTH-889102-DH',
    subtotal: 2450,
    shipping: 70,
    discount: 0,
    total: 2520,
    profitBDT: 800,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Tanvir Ahmed',
      street: 'House 42, Road 11, Block D, Banani',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1213',
      country: 'Bangladesh',
      phone: '+8801712345678'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Wireless Noise-Canceling ANC Headphones Pro',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 2450,
        quantity: 1,
        subtotal: 2450
      }
    ]
  },
  {
    id: 'ord-res-102',
    orderNumber: 'ORD-10488',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-102',
    customerName: 'Farhana Akter',
    customerEmail: 'farhana.akter@example.com',
    customerPhone: '+8801819876543',
    customerCity: 'Chittagong',
    status: 'Shipped',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-441299-CTG',
    subtotal: 3700,
    shipping: 130,
    discount: 0,
    total: 3830,
    profitBDT: 1300,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Farhana Akter',
      street: 'GEC Circle, Nasirabad Housing Society',
      city: 'Chittagong',
      state: 'Chittagong',
      zipCode: '4000',
      country: 'Bangladesh',
      phone: '+8801819876543'
    },
    items: [
      {
        productId: 'prod-3',
        productName: 'Smart Fitness Tracker Watch with AMOLED Display',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 1850,
        quantity: 2,
        subtotal: 3700
      }
    ]
  },
  {
    id: 'ord-res-103',
    orderNumber: 'ORD-10482',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-103',
    customerName: 'Sabbir Hossain',
    customerEmail: 'sabbir.h@example.com',
    customerPhone: '+8801911223344',
    customerCity: 'Dhaka',
    status: 'Processing',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-559102-DH',
    subtotal: 1700,
    shipping: 70,
    discount: 0,
    total: 1770,
    profitBDT: 800,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Sabbir Hossain',
      street: 'Flat 5B, Concord Tower, Dhanmondi 27',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1209',
      country: 'Bangladesh',
      phone: '+8801911223344'
    },
    items: [
      {
        productId: 'prod-4',
        productName: 'Handcrafted Genuine Leather Minimalist Cardholder Wallet',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 850,
        quantity: 2,
        subtotal: 1700
      }
    ]
  },
  {
    id: 'ord-res-104',
    orderNumber: 'ORD-10475',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-104',
    customerName: 'Nusrat Jahan',
    customerEmail: 'nusrat.j@example.com',
    customerPhone: '+8801615556677',
    customerCity: 'Sylhet',
    status: 'Confirmed',
    paymentMethod: 'mobile_money',
    paymentStatus: 'paid',
    courier: 'RedX Delivery',
    trackingNumber: 'RDX-994012-SYL',
    subtotal: 2450,
    shipping: 130,
    discount: 0,
    total: 2580,
    profitBDT: 800,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Nusrat Jahan',
      street: 'Shibganj Point, Near Central Mosque',
      city: 'Sylhet',
      state: 'Sylhet',
      zipCode: '3100',
      country: 'Bangladesh',
      phone: '+8801615556677'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Wireless Noise-Canceling ANC Headphones Pro',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 2450,
        quantity: 1,
        subtotal: 2450
      }
    ]
  },
  {
    id: 'ord-res-105',
    orderNumber: 'ORD-10460',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-101',
    customerName: 'Tanvir Ahmed',
    customerEmail: 'tanvir.ahmed@example.com',
    customerPhone: '+8801712345678',
    customerCity: 'Dhaka',
    status: 'Pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Pathao Courier',
    subtotal: 1450,
    shipping: 70,
    discount: 0,
    total: 1520,
    profitBDT: 600,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Tanvir Ahmed',
      street: 'House 42, Road 11, Block D, Banani',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1213',
      country: 'Bangladesh',
      phone: '+8801712345678'
    },
    items: [
      {
        productId: 'prod-6',
        productName: 'Ergonomic Memory Foam Back Cushion',
        imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 1450,
        quantity: 1,
        subtotal: 1450
      }
    ]
  },
  {
    id: 'ord-res-106',
    orderNumber: 'ORD-10430',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-106',
    customerName: 'Kazi Ashiqur Rahman',
    customerEmail: 'kazi.ashiq@example.com',
    customerPhone: '+8801788990011',
    customerCity: 'Dhaka',
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-112344-DH',
    subtotal: 4900,
    shipping: 70,
    discount: 0,
    total: 4970,
    profitBDT: 1600,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Kazi Ashiqur Rahman',
      street: 'Sector 3, Uttara Model Town',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1230',
      country: 'Bangladesh',
      phone: '+8801788990011'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Wireless Noise-Canceling ANC Headphones Pro',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 2450,
        quantity: 2,
        subtotal: 4900
      }
    ]
  },
  {
    id: 'ord-res-107',
    orderNumber: 'ORD-10390',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-107',
    customerName: 'Samira Huq',
    customerEmail: 'samira.huq@example.com',
    customerPhone: '+8801977665544',
    customerCity: 'Rajshahi',
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-778811-RAJ',
    subtotal: 1850,
    shipping: 130,
    discount: 0,
    total: 1980,
    profitBDT: 650,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Samira Huq',
      street: 'Alupatti Moor, Boalia',
      city: 'Rajshahi',
      state: 'Rajshahi',
      zipCode: '6000',
      country: 'Bangladesh',
      phone: '+8801977665544'
    },
    items: [
      {
        productId: 'prod-3',
        productName: 'Smart Fitness Tracker Watch with AMOLED Display',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 1850,
        quantity: 1,
        subtotal: 1850
      }
    ]
  },
  {
    id: 'ord-res-108',
    orderNumber: 'ORD-10250',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-108',
    customerName: 'Rashedul Karim',
    customerEmail: 'rashed.karim@example.com',
    customerPhone: '+8801555443322',
    customerCity: 'Sylhet',
    status: 'Cancelled',
    paymentMethod: 'cod',
    paymentStatus: 'failed',
    courier: 'Pathao Courier',
    subtotal: 850,
    shipping: 130,
    discount: 0,
    total: 980,
    profitBDT: 400,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Rashedul Karim',
      street: 'Amberkhana Point',
      city: 'Sylhet',
      state: 'Sylhet',
      zipCode: '3100',
      country: 'Bangladesh',
      phone: '+8801555443322'
    },
    items: [
      {
        productId: 'prod-4',
        productName: 'Handcrafted Genuine Leather Minimalist Cardholder Wallet',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 850,
        quantity: 1,
        subtotal: 850
      }
    ]
  },
  {
    id: 'ord-res-109',
    orderNumber: 'ORD-10110',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    resellerName: 'Arif Chowdhury',
    customerId: 'cust-103',
    customerName: 'Sabbir Hossain',
    customerEmail: 'sabbir.h@example.com',
    customerPhone: '+8801911223344',
    customerCity: 'Dhaka',
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-990182-DH',
    subtotal: 2450,
    shipping: 70,
    discount: 0,
    total: 2520,
    profitBDT: 800,
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 72 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      fullName: 'Sabbir Hossain',
      street: 'Flat 5B, Concord Tower, Dhanmondi 27',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1209',
      country: 'Bangladesh',
      phone: '+8801911223344'
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Wireless Noise-Canceling ANC Headphones Pro',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-01',
        sellerName: 'Dhaka Trendz Collection',
        price: 2450,
        quantity: 1,
        subtotal: 2450
      }
    ]
  },
  // Chittagong Smart Gadgets (4 orders)
  {
    id: 'ord-res-201',
    orderNumber: 'ORD-20811',
    resellerId: 'usr-res-02',
    storeName: 'Chittagong Smart Gadgets',
    storeSlug: 'ctg-gadgets',
    resellerName: 'Zubair Hossain',
    customerId: 'cust-201',
    customerName: 'Rafiqul Islam',
    customerEmail: 'rafiqul@example.com',
    customerPhone: '+8801811223344',
    customerCity: 'Chattogram',
    status: 'Processing',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-8102-CTG',
    subtotal: 4800,
    shipping: 130,
    discount: 0,
    total: 4930,
    profitBDT: 1550,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    shippingAddress: {
      fullName: 'Rafiqul Islam',
      street: 'Agrabad Commercial Area',
      city: 'Chattogram',
      state: 'Chattogram',
      zipCode: '4100',
      country: 'Bangladesh',
      phone: '+8801811223344'
    },
    items: [
      {
        productId: 'prod-earbuds-pro',
        productName: 'Wireless Earbuds Pro with Spatial Audio',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-02',
        sellerName: 'Chittagong Smart Gadgets',
        price: 2400,
        quantity: 2,
        subtotal: 4800
      }
    ]
  },
  {
    id: 'ord-res-202',
    orderNumber: 'ORD-20794',
    resellerId: 'usr-res-02',
    storeName: 'Chittagong Smart Gadgets',
    storeSlug: 'ctg-gadgets',
    resellerName: 'Zubair Hossain',
    customerId: 'cust-202',
    customerName: 'Mehedi Hasan',
    customerEmail: 'mehedi.h@example.com',
    customerPhone: '+8801822334455',
    customerCity: 'Chattogram',
    status: 'Shipped',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Pathao Courier',
    trackingNumber: 'PTH-9921-CTG',
    subtotal: 3200,
    shipping: 130,
    discount: 0,
    total: 3330,
    profitBDT: 950,
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    shippingAddress: {
      fullName: 'Mehedi Hasan',
      street: 'Halishahar Housing Estate',
      city: 'Chattogram',
      state: 'Chattogram',
      zipCode: '4216',
      country: 'Bangladesh',
      phone: '+8801822334455'
    },
    items: [
      {
        productId: 'prod-smartwatch',
        productName: 'Smart Fitness Tracker Watch',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-02',
        sellerName: 'Chittagong Smart Gadgets',
        price: 3200,
        quantity: 1,
        subtotal: 3200
      }
    ]
  },
  {
    id: 'ord-res-203',
    orderNumber: 'ORD-20755',
    resellerId: 'usr-res-02',
    storeName: 'Chittagong Smart Gadgets',
    storeSlug: 'ctg-gadgets',
    resellerName: 'Zubair Hossain',
    customerId: 'cust-203',
    customerName: 'Nasrin Sultana',
    customerEmail: 'nasrin.s@example.com',
    customerPhone: '+8801833445566',
    customerCity: 'Cox\'s Bazar',
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    courier: 'Steadfast Courier',
    trackingNumber: 'STF-5501-CXB',
    subtotal: 2150,
    shipping: 150,
    discount: 0,
    total: 2300,
    profitBDT: 700,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    shippingAddress: {
      fullName: 'Nasrin Sultana',
      street: 'Kolatoli Road',
      city: 'Cox\'s Bazar',
      state: 'Chattogram',
      zipCode: '4700',
      country: 'Bangladesh',
      phone: '+8801833445566'
    },
    items: [
      {
        productId: 'prod-earbuds-pro',
        productName: 'Wireless Earbuds Pro',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-02',
        sellerName: 'Chittagong Smart Gadgets',
        price: 2150,
        quantity: 1,
        subtotal: 2150
      }
    ]
  },
  {
    id: 'ord-res-204',
    orderNumber: 'ORD-20710',
    resellerId: 'usr-res-02',
    storeName: 'Chittagong Smart Gadgets',
    storeSlug: 'ctg-gadgets',
    resellerName: 'Zubair Hossain',
    customerId: 'cust-204',
    customerName: 'Kamal Uddin',
    customerEmail: 'kamal.u@example.com',
    customerPhone: '+8801844556677',
    customerCity: 'Chattogram',
    status: 'Pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Direct / In-House Delivery',
    subtotal: 1850,
    shipping: 70,
    discount: 0,
    total: 1920,
    profitBDT: 550,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    shippingAddress: {
      fullName: 'Kamal Uddin',
      street: 'Chawkbazar Main Road',
      city: 'Chattogram',
      state: 'Chattogram',
      zipCode: '4203',
      country: 'Bangladesh',
      phone: '+8801844556677'
    },
    items: [
      {
        productId: 'prod-earbuds-pro',
        productName: 'Wireless Bluetooth Earbuds',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-02',
        sellerName: 'Chittagong Smart Gadgets',
        price: 1850,
        quantity: 1,
        subtotal: 1850
      }
    ]
  },
  // Sylhet Artisan Crafts (2 orders)
  {
    id: 'ord-res-301',
    orderNumber: 'ORD-30120',
    resellerId: 'usr-res-03',
    storeName: 'Sylhet Artisan Crafts',
    storeSlug: 'sylhet-crafts',
    resellerName: 'Mitali Deb',
    customerId: 'cust-301',
    customerName: 'Shaila Parveen',
    customerEmail: 'shaila.p@example.com',
    customerPhone: '+8801912345678',
    customerCity: 'Sylhet',
    status: 'Pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    courier: 'Steadfast Courier',
    subtotal: 2600,
    shipping: 130,
    discount: 0,
    total: 2730,
    profitBDT: 850,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    shippingAddress: {
      fullName: 'Shaila Parveen',
      street: 'Zindabazar Point',
      city: 'Sylhet',
      state: 'Sylhet',
      zipCode: '3100',
      country: 'Bangladesh',
      phone: '+8801912345678'
    },
    items: [
      {
        productId: 'prod-scented-candle',
        productName: 'Artisan Sandalwood & Cedar Candle',
        imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-03',
        sellerName: 'Sylhet Artisan Crafts',
        price: 1300,
        quantity: 2,
        subtotal: 2600
      }
    ]
  },
  {
    id: 'ord-res-302',
    orderNumber: 'ORD-30095',
    resellerId: 'usr-res-03',
    storeName: 'Sylhet Artisan Crafts',
    storeSlug: 'sylhet-crafts',
    resellerName: 'Mitali Deb',
    customerId: 'cust-302',
    customerName: 'Anwarul Karim',
    customerEmail: 'anwarul@example.com',
    customerPhone: '+8801923456789',
    customerCity: 'Sylhet',
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    courier: 'Sundarban Courier Service',
    trackingNumber: 'SUN-7721-SYL',
    subtotal: 3900,
    shipping: 130,
    discount: 0,
    total: 4030,
    profitBDT: 1200,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    shippingAddress: {
      fullName: 'Anwarul Karim',
      street: 'Shahjalal Upashahar, Block B',
      city: 'Sylhet',
      state: 'Sylhet',
      zipCode: '3100',
      country: 'Bangladesh',
      phone: '+8801923456789'
    },
    items: [
      {
        productId: 'prod-scented-candle',
        productName: 'Handcrafted Ceramic Vessel Candle Set',
        imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
        sellerId: 'usr-res-03',
        sellerName: 'Sylhet Artisan Crafts',
        price: 3900,
        quantity: 1,
        subtotal: 3900
      }
    ]
  }
];

export const INITIAL_RESELLER_NOTIFICATIONS: ResellerNotification[] = [
  {
    id: 'rn-101',
    resellerId: 'usr-res-01',
    title: 'Payout Request Dispatched',
    message: 'Your withdrawal request #WTH-8818 of ৳4,500 has been sent to your bKash account (01712-345678). TrxID: BK-TRX-4491029.',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    link: 'wallet'
  },
  {
    id: 'rn-102',
    resellerId: 'usr-res-01',
    title: 'New Customer COD Order Received',
    message: 'Order #ORD-10492 for Wireless Noise-Canceling ANC Headphones Pro (৳2,450) was placed by Tanvir Ahmed.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    link: 'orders'
  },
  {
    id: 'rn-103',
    resellerId: 'usr-res-01',
    title: 'Steadfast Delivery Confirmation',
    message: 'Shipment STF-112344-DH has been delivered to customer in Uttara, Dhaka. COD funds will clear within 24 hours.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    link: 'orders'
  },
  {
    id: 'rn-104',
    resellerId: 'usr-res-01',
    title: 'Pro Partner Subscription Renewal',
    message: 'Your Pro Partner subscription is active until October 24, 2026. Enjoy unlimited product listings and priority dispatch!',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    link: 'subscription'
  }
];
