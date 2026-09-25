import { Order } from '@/types/marketplace';

/**
 * Interface for store order summaries in breakdown view
 */
export interface StoreOrderSummary {
  storeSlug: string;
  storeName: string;
  resellerId?: string;
  resellerName: string;
  contactPhone?: string;
  totalOrders: number;
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  totalSalesVolume: number;
  totalProfit: number;
  isResellerStore: boolean;
}

/**
 * Resolves store details from an order and the admin resellers directory
 */
export function getOrderStoreInfo(order: Order, resellersList: any[] = []): {
  storeSlug: string;
  storeName: string;
  resellerName: string;
  contactPhone: string;
  isResellerStore: boolean;
} {
  const oStoreSlug = order.storeSlug || '';
  const oResellerId = order.resellerId || '';
  const oStoreName = order.storeName || '';
  const oResellerName = order.resellerName || '';

  // 1. Check in Admin resellers directory
  const matched = resellersList.find(r => 
    (oStoreSlug && r.storeSlug === oStoreSlug) ||
    (oResellerId && (r.resellerId === oResellerId || r.id === oResellerId)) ||
    (oStoreName && r.storeName?.toLowerCase() === oStoreName.toLowerCase())
  );

  if (matched) {
    return {
      storeSlug: matched.storeSlug || oStoreSlug || 'store',
      storeName: matched.storeName || oStoreName || 'Reseller Store',
      resellerName: matched.ownerName || oResellerName || 'Verified Merchant',
      contactPhone: matched.contactPhone || matched.phone || '',
      isResellerStore: true
    };
  }

  // 2. Direct info on order object
  if (oStoreSlug || oStoreName || oResellerId) {
    return {
      storeSlug: oStoreSlug || (oResellerId ? `store-${oResellerId.slice(0, 6)}` : 'store'),
      storeName: oStoreName || 'Reseller Store',
      resellerName: oResellerName || 'Partner Reseller',
      contactPhone: (order as any).customerPhone || '',
      isResellerStore: true
    };
  }

  // 3. Fallback to Central / Direct Marketplace Feed
  const firstSeller = order.items?.[0]?.sellerName || order.subOrders?.[0]?.sellerName;
  return {
    storeSlug: 'central-feed',
    storeName: firstSeller ? `${firstSeller} (Marketplace)` : 'Central Marketplace Feed',
    resellerName: 'Zero Invest Central',
    contactPhone: '+8801700000001',
    isResellerStore: false
  };
}

/**
 * Escapes a cell value for standard CSV (RFC 4180)
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a browser download for CSV content with UTF-8 BOM
 */
function downloadCSV(csvContent: string, fileName: string) {
  // Prepend UTF-8 BOM (\uFEFF) so Excel / Google Sheets open Unicode text (Bengali characters) correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a timestamp into a clean human-readable date
 */
function formatOrderDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch {}
  return dateString;
}

/**
 * Exports currently filtered orders as a formatted CSV file
 */
export function exportOrdersToCSV(
  ordersToExport: Order[],
  resellersList: any[] = [],
  options?: {
    storeFilter?: string;
    storeName?: string;
    statusFilter?: string;
  }
): boolean {
  if (!ordersToExport || ordersToExport.length === 0) {
    return false;
  }

  const headers = [
    'Order Number',
    'Order ID',
    'Order Date & Time',
    'Store Name',
    'Store Slug',
    'Reseller Merchant',
    'Merchant Phone',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Delivery Street Address',
    'Delivery City / District',
    'Unique SKUs',
    'Total Units Quantity',
    'Items Breakdown (SKU, Qty, Unit Price)',
    'Subtotal (BDT)',
    'Shipping Fee (BDT)',
    'Discount (BDT)',
    'Total Amount (BDT)',
    'Reseller Profit (BDT)',
    'Payment Method',
    'Payment Status',
    'Fulfillment Status',
    'Courier Partner',
    'Tracking Number',
    'Fulfillment Notes'
  ];

  const rows = ordersToExport.map(order => {
    const storeInfo = getOrderStoreInfo(order, resellersList);
    const items = order.items || [];
    
    // Inventory & item calculations
    const uniqueSKUs = items.length;
    const totalUnits = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
    const itemsSummary = items
      .map(it => `${it.productName || (it as any).name || 'Item'} (Qty: ${it.quantity || 1}, Unit: ৳${it.price || 0})`)
      .join(' | ');

    const subtotal = order.subtotal || Math.max(0, (order.total || 0) - (order.shipping || 0));
    const shipping = order.shipping || 0;
    const discount = order.discount || 0;
    const total = order.total || (order as any).totalAmountBDT || 0;
    const profit = (order as any).profitBDT || (order as any).resellerProfit || Math.round(total * 0.25);

    const address = (order.shippingAddress as any)?.address || order.shippingAddress?.street || 'Standard Address';
    const city = order.shippingAddress?.city || (order.shippingAddress as any)?.district || 'Bangladesh';
    const phone = order.shippingAddress?.phone || (order as any).customerPhone || '';
    const courier = order.courier || (order as any).carrier || 'Unassigned';

    return [
      escapeCSV(order.orderNumber || order.id),
      escapeCSV(order.id),
      escapeCSV(formatOrderDate(order.createdAt)),
      escapeCSV(storeInfo.storeName),
      escapeCSV(`/r/${storeInfo.storeSlug}`),
      escapeCSV(storeInfo.resellerName),
      escapeCSV(storeInfo.contactPhone),
      escapeCSV(order.customerName || 'Customer'),
      escapeCSV(phone),
      escapeCSV(order.customerEmail || ''),
      escapeCSV(address),
      escapeCSV(city),
      escapeCSV(uniqueSKUs),
      escapeCSV(totalUnits),
      escapeCSV(itemsSummary),
      escapeCSV(subtotal),
      escapeCSV(shipping),
      escapeCSV(discount),
      escapeCSV(total),
      escapeCSV(profit),
      escapeCSV((order.paymentMethod || 'COD').toUpperCase()),
      escapeCSV((order.paymentStatus || 'pending').toUpperCase()),
      escapeCSV(order.status || 'Pending'),
      escapeCSV(courier),
      escapeCSV(order.trackingNumber || 'Unassigned'),
      escapeCSV(order.notes || '')
    ].join(',');
  });

  const csvBody = [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');

  // File naming
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  let prefix = 'orders_export';
  if (options?.storeName && options.storeFilter && options.storeFilter !== 'all') {
    prefix = `orders_${options.storeFilter.replace(/[^a-z0-9_-]/gi, '_')}`;
  } else if (options?.statusFilter && options.statusFilter !== 'all') {
    prefix = `orders_${options.statusFilter.toLowerCase()}`;
  }

  const fileName = `${prefix}_${dateStr}.csv`;
  downloadCSV(csvBody, fileName);
  return true;
}

/**
 * Exports store breakdown analytics table as a CSV
 */
export function exportStoreBreakdownToCSV(breakdownList: StoreOrderSummary[]): boolean {
  if (!breakdownList || breakdownList.length === 0) return false;

  const headers = [
    'Store Name',
    'Store Slug',
    'Channel Type',
    'Reseller Merchant',
    'WhatsApp Contact',
    'Total Orders',
    'Pending Orders',
    'Processing Orders',
    'In Transit Orders',
    'Delivered Orders',
    'Cancelled Orders',
    'Total Sales GMV (BDT)',
    'Reseller Margin / Profit (BDT)'
  ];

  const rows = breakdownList.map(store => [
    escapeCSV(store.storeName),
    escapeCSV(`/r/${store.storeSlug}`),
    escapeCSV(store.isResellerStore ? 'Reseller Storefront' : 'Central Feed'),
    escapeCSV(store.resellerName),
    escapeCSV(store.contactPhone || 'N/A'),
    escapeCSV(store.totalOrders),
    escapeCSV(store.pendingCount),
    escapeCSV(store.processingCount),
    escapeCSV(store.shippedCount),
    escapeCSV(store.deliveredCount),
    escapeCSV(store.cancelledCount),
    escapeCSV(store.totalSalesVolume),
    escapeCSV(store.totalProfit)
  ].join(','));

  const csvBody = [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `store_performance_breakdown_${dateStr}.csv`;
  downloadCSV(csvBody, fileName);
  return true;
}
