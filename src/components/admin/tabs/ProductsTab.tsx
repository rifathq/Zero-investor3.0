'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Product } from '@/types/marketplace';
import { formatBDT } from '@/lib/formatters';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  DollarSign, 
  Layers, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  Image as ImageIcon, 
  ArrowUpDown, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Power,
  Calendar,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { ProductImageUploader } from '../common/ProductImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export function ProductsTab() {
  const { products: resellerProducts, isLoadingProducts, updateProductModeration } = useAdmin();
  const { 
    products: catalogProducts = [], 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    showToast,
    categories = [] 
  } = useMarketplace();

  const [activeCatalogTab, setActiveCatalogTab] = useState<'platform-catalog' | 'reseller-products'>('platform-catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modal State for Adding/Editing Platform Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Preview Modal
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewActiveImageIdx, setPreviewActiveImageIdx] = useState<number>(0);

  // Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Product Form Fields (Multi-Section Form)
  // Section 1: PRODUCT INFORMATION
  const [formName, setFormName] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formBrand, setFormBrand] = useState('Artisan Direct');
  const [formSku, setFormSku] = useState('');

  // Section 2: PRICING
  const [formSupplierPrice, setFormSupplierPrice] = useState<number>(1200);
  const [formSuggestedPrice, setFormSuggestedPrice] = useState<number>(1850);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number | undefined>(undefined);

  // Section 3: INVENTORY
  const [formStockCount, setFormStockCount] = useState<number>(50);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number>(10);

  // Section 4: MEDIA (Multi-Image Gallery, up to 5 images)
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'
  ]);

  // Section 5: METADATA & STATUS
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formBenefits, setFormBenefits] = useState<string>(
    '100% Cash on Delivery across Bangladesh\n7-Day verified replacement warranty\nWholesale reseller margin guaranteed'
  );

  // Automatic profit calculations
  const calculatedProfit = Math.max(0, formSuggestedPrice - formSupplierPrice);
  const calculatedMargin = formSuggestedPrice > 0 ? Math.round((calculatedProfit / formSuggestedPrice) * 100) : 0;

  const openAddModal = () => {
    setEditingProductId(null);
    setFormName('');
    setFormShortDescription('High-converting wholesale consumer good with fast courier turnaround.');
    setFormDescription('Authentic high-demand wholesale product for Bangladesh resellers. Hand-inspected and ready for nationwide Cash on Delivery dispatch with zero upfront inventory cost.');
    setFormCategory('Electronics');
    setFormBrand('Zero Invest Sourced');
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormSupplierPrice(1200);
    setFormSuggestedPrice(1850);
    setFormDiscountPrice(undefined);
    setFormStockCount(50);
    setFormLowStockThreshold(10);
    setFormImages(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']);
    setFormIsActive(true);
    setFormBenefits('100% Cash on Delivery across Bangladesh\n7-Day verified replacement warranty\nWholesale reseller margin guaranteed');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product, focusSection?: 'images') => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormShortDescription(prod.description.substring(0, 100));
    setFormDescription(prod.description);
    setFormCategory(prod.category);
    setFormBrand(prod.brand || 'Artisan Direct');
    setFormSku(prod.sku || `SKU-${prod.id.slice(-6)}`);
    setFormSupplierPrice(prod.supplierPrice || Math.round(prod.price * 0.65));
    setFormSuggestedPrice(prod.suggestedPrice || prod.price);
    setFormDiscountPrice(prod.originalPrice);
    setFormStockCount(prod.stockCount || 50);
    setFormLowStockThreshold(10);

    // Combine imageUrl and additionalImages into an array of up to 5 images
    const combinedImages = [
      prod.imageUrl,
      ...(prod.additionalImages || [])
    ].filter(Boolean);
    setFormImages(combinedImages.length > 0 ? combinedImages : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']);

    setFormBenefits((prod.benefits || ['100% Cash on Delivery across Bangladesh', '7-Day warranty']).join('\n'));
    setFormIsActive(prod.isActive !== false);
    setIsModalOpen(true);
  };

  const openPreviewModal = (prod: Product) => {
    setPreviewProduct(prod);
    setPreviewActiveImageIdx(0);
  };

  const handleToggleStatus = (prod: Product) => {
    const nextStatus = !(prod.isActive !== false);
    updateProduct(prod.id, { isActive: nextStatus });
    showToast(
      'Product Status Updated',
      `"${prod.name}" is now ${nextStatus ? 'Active & Published' : 'Inactive & Hidden'}.`,
      'info'
    );
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Validation Error', 'Product name is required.', 'error');
      return;
    }
    if (formImages.length === 0) {
      showToast('Validation Error', 'At least one product image is required.', 'error');
      return;
    }

    const benefitsArray = formBenefits
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    // Primary image is images[0], secondary images are images.slice(1)
    const primaryImage = formImages[0];
    const secondaryImages = formImages.slice(1);

    // Match categoryId from active categories list
    const matchedCat = categories.find(c => 
      c.name.toLowerCase() === formCategory.toLowerCase() ||
      c.id.toLowerCase() === formCategory.toLowerCase()
    );
    const resolvedCategoryId = matchedCat?.id;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formName.trim(),
        category: formCategory,
        categoryId: resolvedCategoryId,
        brand: formBrand.trim(),
        sku: formSku.trim(),
        description: formDescription.trim(),
        supplierPrice: formSupplierPrice,
        price: formSuggestedPrice,
        suggestedPrice: formSuggestedPrice,
        originalPrice: formDiscountPrice,
        resellerProfit: calculatedProfit,
        stockCount: formStockCount,
        inStock: formStockCount > 0,
        imageUrl: primaryImage,
        additionalImages: secondaryImages,
        benefits: benefitsArray,
        isActive: formIsActive
      });
      showToast('Product Updated', `"${formName}" has been updated in the catalog.`, 'success');
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        categoryId: resolvedCategoryId,
        brand: formBrand.trim(),
        sku: formSku.trim(),
        description: formDescription.trim(),
        supplierPrice: formSupplierPrice,
        price: formSuggestedPrice,
        suggestedPrice: formSuggestedPrice,
        originalPrice: formDiscountPrice,
        resellerProfit: calculatedProfit,
        rating: 4.8,
        reviewCount: 0,
        stockCount: formStockCount,
        inStock: formStockCount > 0,
        imageUrl: primaryImage,
        additionalImages: secondaryImages,
        benefits: benefitsArray,
        isActive: formIsActive,
        sellerId: 'zero-invest-official',
        sellerName: 'Zero Invest Wholesale Hub'
      });
      showToast('Product Created', `"${formName}" has been added to the catalog.`, 'success');
    }

    setIsModalOpen(false);
  };

  const confirmDelete = (prod: Product) => {
    setProductToDelete(prod);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      showToast('Product Deleted', `"${productToDelete.name}" was removed from the catalog.`, 'info');
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return (catalogProducts || []).filter(prod => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (prod.name || '').toLowerCase().includes(q);
        const matchCategory = (prod.category || '').toLowerCase().includes(q);
        const matchBrand = (prod.brand || '').toLowerCase().includes(q);
        const matchSku = (prod.sku || prod.id || '').toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchBrand && !matchSku) return false;
      }

      // Category
      if (categoryFilter !== 'all' && prod.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'all') {
        const isActive = prod.isActive !== false;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }

      // Stock Filter
      if (stockFilter !== 'all') {
        const count = prod.stockCount || 0;
        if (stockFilter === 'in_stock' && count <= 0) return false;
        if (stockFilter === 'low_stock' && (count <= 0 || count > 10)) return false;
        if (stockFilter === 'out_of_stock' && count > 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.suggestedPrice || a.price) - (b.suggestedPrice || b.price);
      if (sortBy === 'price-desc') return (b.suggestedPrice || b.price) - (a.suggestedPrice || a.price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // newest first by default
    });
  }, [catalogProducts, searchQuery, categoryFilter, statusFilter, stockFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / itemsPerPage));
  const paginatedCatalog = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCatalog.slice(start, start + itemsPerPage);
  }, [filteredCatalog, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <AdminPageHeader
        title="Products &amp; Wholesale Catalog"
        description="Add, edit, manage multi-image galleries, and curate wholesale supplier items for independent resellers."
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        }
      />

      {/* Segmented Tab Controls: Platform Catalog vs. Reseller Listings */}
      <div className="flex items-center gap-4 border-b border-neutral-200">
        <button
          onClick={() => { setActiveCatalogTab('platform-catalog'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeCatalogTab === 'platform-catalog'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Wholesale Catalog ({catalogProducts?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveCatalogTab('reseller-products'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeCatalogTab === 'reseller-products'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Reseller Storefront Listings ({resellerProducts?.length || 0})</span>
        </button>
      </div>

      {activeCatalogTab === 'platform-catalog' ? (
        <div className="space-y-6">
          
          {/* Filter and Search Bar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by name, SKU, brand, or category..."
                  className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <select
                  value={stockFilter}
                  onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low_stock">Low Stock (&le; 10)</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Data Table */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
            {paginatedCatalog.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products found"
                description="Try adjusting your search terms or filters to find what you are looking for."
                actionText="Add Product"
                onAction={openAddModal}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      <th className="py-4 pl-6 pr-3">Thumbnail</th>
                      <th className="py-4 px-3">Product Name</th>
                      <th className="py-4 px-3">Category</th>
                      <th className="py-4 px-3">Price</th>
                      <th className="py-4 px-3">Stock</th>
                      <th className="py-4 px-3">Status</th>
                      <th className="py-4 px-3">Created Date</th>
                      <th className="py-4 pr-6 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {paginatedCatalog.map((prod) => {
                      const supplier = prod.supplierPrice || Math.round(prod.price * 0.65);
                      const retail = prod.suggestedPrice || prod.price;
                      const margin = Math.max(0, retail - supplier);
                      const imageCount = 1 + (prod.additionalImages?.length || 0);
                      const formattedDate = prod.createdAt 
                        ? new Date(prod.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Active';

                      return (
                        <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* 1. Thumbnail */}
                          <td className="py-4 pl-6 pr-3">
                            <div className="relative w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                                }}
                              />
                              {imageCount > 1 && (
                                <div className="absolute bottom-0.5 right-0.5 bg-neutral-900/85 text-white text-[9px] font-bold px-1 rounded">
                                  {imageCount}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 2. Product Name & SKU */}
                          <td className="py-4 px-3">
                            <div className="font-bold text-neutral-900 line-clamp-1 max-w-[220px]">
                              {prod.name}
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              <span>{prod.brand || 'Artisan Direct'}</span>
                              <span>·</span>
                              <span className="font-mono text-neutral-400">SKU: {prod.sku || prod.id.slice(-6)}</span>
                            </div>
                          </td>

                          {/* 3. Category */}
                          <td className="py-4 px-3 text-neutral-700 font-medium whitespace-nowrap">
                            {prod.category}
                          </td>

                          {/* 4. Price (Wholesale & Retail) */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="font-bold text-neutral-900">{formatBDT(retail)}</div>
                            <div className="text-xs text-neutral-500 font-medium">
                              Cost: {formatBDT(supplier)} (Margin: +{formatBDT(margin)})
                            </div>
                          </td>

                          {/* 5. Stock */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            {prod.stockCount <= 0 ? (
                              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                Out of Stock
                              </span>
                            ) : prod.stockCount <= 10 ? (
                              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Low ({prod.stockCount})
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-neutral-700">
                                {prod.stockCount} units
                              </span>
                            )}
                          </td>

                          {/* 6. Status */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <StatusBadge status={prod.isActive !== false ? 'Active' : 'Inactive'} />
                          </td>

                          {/* 7. Created Date */}
                          <td className="py-4 px-3 text-xs text-neutral-500 whitespace-nowrap">
                            {formattedDate}
                          </td>

                          {/* 8. Actions (View, Edit, Manage Images, Change Status, Delete) */}
                          <td className="py-4 pr-6 pl-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* View */}
                              <button
                                type="button"
                                onClick={() => openPreviewModal(prod)}
                                title="View Product Details"
                                className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => openEditModal(prod)}
                                title="Edit Product"
                                className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Manage Images */}
                              <button
                                type="button"
                                onClick={() => openEditModal(prod, 'images')}
                                title="Manage Product Images"
                                className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>

                              {/* Change Status */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(prod)}
                                title={prod.isActive !== false ? 'Deactivate Product' : 'Activate Product'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  prod.isActive !== false
                                    ? 'text-emerald-700 hover:bg-emerald-50'
                                    : 'text-neutral-400 hover:bg-neutral-100'
                                }`}
                              >
                                <Power className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => confirmDelete(prod)}
                                title="Delete Product"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 sm:p-5 border-t border-neutral-200 flex items-center justify-between">
                <div className="text-xs text-neutral-500">
                  Showing {Math.min(filteredCatalog.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                  {Math.min(filteredCatalog.length, currentPage * itemsPerPage)} of {filteredCatalog.length} products
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-neutral-900 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Tab 2: Reseller Moderation Table */
        <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900">Reseller Storefront Listings</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review custom titles, selling margins, and moderation approvals for products listed in reseller dropship stores.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-4 pl-6 pr-4">Reseller Listing</th>
                  <th className="py-4 px-4">Storefront</th>
                  <th className="py-4 px-4">Supplier Cost</th>
                  <th className="py-4 px-4">Reseller Retail</th>
                  <th className="py-4 px-4">Reseller Profit</th>
                  <th className="py-4 px-4">Moderation</th>
                  <th className="py-4 pr-6 pl-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {(resellerProducts || []).map((rp) => (
                  <tr key={rp.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 pl-6 pr-4 font-bold text-neutral-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={rp.imageUrl}
                          alt={rp.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                          }}
                        />
                        <div>
                          <div className="line-clamp-1">{rp.productName}</div>
                          <div className="text-xs text-neutral-400">{rp.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-neutral-700">
                      {rp.storeId || rp.resellerId}
                    </td>
                    <td className="py-4 px-4 font-bold text-neutral-900">
                      {formatBDT(rp.resellerPrice || 0)}
                    </td>
                    <td className="py-4 px-4 font-bold text-neutral-900">
                      {formatBDT(rp.suggestedPrice || 0)}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-700">
                      {formatBDT(rp.potentialProfit || Math.max(0, (rp.suggestedPrice || 0) - (rp.resellerPrice || 0)))}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={rp.isActive ? 'Approved' : 'Pending'} />
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => updateProductModeration(rp.id, !rp.isActive ? 'approved' : 'rejected')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          !rp.isActive 
                            ? 'bg-neutral-900 hover:bg-black text-white shadow-xs' 
                            : 'bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-700 border border-neutral-200'
                        }`}
                      >
                        {!rp.isActive ? 'Approve Listing' : 'Suspend Listing'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRODUCT PREVIEW MODAL
         ========================================================================= */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Product Preview</h3>
                <p className="text-xs text-neutral-500">Catalog details and multi-image showcase</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Image Preview & Gallery */}
              {(() => {
                const imgs = [previewProduct.imageUrl, ...(previewProduct.additionalImages || [])].filter(Boolean);
                const activeImg = imgs[previewActiveImageIdx] || previewProduct.imageUrl;

                return (
                  <div className="space-y-3">
                    <div className="w-full aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
                      <img src={activeImg} alt={previewProduct.name} className="w-full h-full object-contain bg-white" />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={previewProduct.isActive !== false ? 'Active' : 'Inactive'} />
                      </div>
                    </div>

                    {imgs.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {imgs.map((im, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreviewActiveImageIdx(idx)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              previewActiveImageIdx === idx ? 'border-neutral-900' : 'border-neutral-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={im} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Title & Metadata */}
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                  {previewProduct.category} · {previewProduct.brand || 'Artisan Direct'}
                </div>
                <h4 className="text-2xl font-bold text-neutral-900 mt-1">{previewProduct.name}</h4>
                <div className="text-xs font-mono text-neutral-400 mt-1">SKU: {previewProduct.sku || previewProduct.id}</div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div>
                  <div className="text-[11px] uppercase font-semibold text-neutral-500">Supplier Price</div>
                  <div className="text-lg font-bold text-neutral-900 mt-0.5">
                    {formatBDT(previewProduct.supplierPrice || Math.round(previewProduct.price * 0.65))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase font-semibold text-neutral-500">Selling Price</div>
                  <div className="text-lg font-bold text-neutral-900 mt-0.5">
                    {formatBDT(previewProduct.suggestedPrice || previewProduct.price)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase font-semibold text-emerald-700">Reseller Margin</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    +{formatBDT(Math.max(0, (previewProduct.suggestedPrice || previewProduct.price) - (previewProduct.supplierPrice || Math.round(previewProduct.price * 0.65))))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Description</h5>
                <p className="text-sm text-neutral-700 leading-relaxed">{previewProduct.description}</p>
              </div>

              {/* Inventory details */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-100/70 rounded-xl text-xs">
                <span className="font-semibold text-neutral-700">Stock Availability:</span>
                <span className="font-bold text-neutral-900">{previewProduct.stockCount} units ready for dispatch</span>
              </div>
            </div>

            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const p = previewProduct;
                  setPreviewProduct(null);
                  openEditModal(p);
                }}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Edit Product
              </button>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MULTI-SECTION "ADD / EDIT PRODUCT" MODAL
          - Product Information
          - Pricing & Auto-Profit Margin
          - Inventory & SKU
          - Media Gallery (Up to 5 images with drag-drop and primary cover selection)
          - Visibility & Warranty Attributes
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-7 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {editingProductId ? 'Edit Wholesale Product' : 'Add New Product to Catalog'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Provide complete product specifications, wholesale pricing, and up to 5 high-res photos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              
              {/* SECTION 1: PRODUCT INFORMATION */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200/80 pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    1. Product Information
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Basic marketplace identifiers and descriptions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Wireless Active Noise Cancelling Headphones Pro"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Marketplace Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
                    >
                      {categories.filter(c => c.status !== 'hidden').map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Brand / Maker
                    </label>
                    <input
                      type="text"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="e.g. Urban Thread, Anker, Artisan BD"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* SKU */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. SKU-889102"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-mono focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Short Tagline / Hook
                    </label>
                    <input
                      type="text"
                      value={formShortDescription}
                      onChange={(e) => setFormShortDescription(e.target.value)}
                      placeholder="e.g. Premium wireless audio with 40-hour battery life."
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Detailed Wholesale Description
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Comprehensive product copy, features, warranty, and merchant details..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & PROFIT MARGIN */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200/80 pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    2. Pricing &amp; Reseller Profit Economics
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Set wholesale cost and suggested consumer retail price in Bangladeshi Taka (৳).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Supplier Price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Wholesale Cost (BDT) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">৳</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formSupplierPrice}
                        onChange={(e) => setFormSupplierPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-bold focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  {/* Suggested Selling Price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Suggested Retail (BDT) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">৳</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formSuggestedPrice}
                        onChange={(e) => setFormSuggestedPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-bold focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  {/* Optional Discount/Strikethrough Price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      MSRP Strikethrough (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">৳</span>
                      <input
                        type="number"
                        min="1"
                        value={formDiscountPrice || ''}
                        onChange={(e) => setFormDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 2400"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Calculated Profit Card */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-900 block">
                        Estimated Reseller Profit Margin
                      </span>
                      <span className="text-xs text-emerald-700">
                        Resellers earn this margin on every COD order dispatched.
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-900">{formatBDT(calculatedProfit)}</div>
                    <div className="text-xs font-bold text-emerald-700">{calculatedMargin}% profit margin</div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: INVENTORY & STOCK */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200/80 pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    3. Inventory &amp; Stock Level
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Manage available units ready for instant dispatch.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Stock Quantity (Units Available) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStockCount}
                      onChange={(e) => setFormStockCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-bold focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Low-Stock Warning Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formLowStockThreshold}
                      onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: PRODUCT IMAGE UPLOAD (UP TO 5 IMAGES) */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200/80 pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    4. Product Photography (Up to 5 Photos)
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Upload up to 5 images. The first image is highlighted as the primary catalog cover.
                  </p>
                </div>

                <ProductImageUploader
                  images={formImages}
                  onChange={setFormImages}
                  maxImages={5}
                />
              </div>

              {/* SECTION 5: METADATA & STATUS */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200/80 pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    5. Features, Warranty &amp; Status
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Customer guarantees and catalog visibility.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      Product Highlights / Selling Points (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formBenefits}
                      onChange={(e) => setFormBenefits(e.target.value)}
                      placeholder="100% Cash on Delivery\n7-Day Warranty\nOriginal Factory Sealed"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                    <input
                      type="checkbox"
                      id="formIsActive"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-black cursor-pointer"
                    />
                    <label htmlFor="formIsActive" className="text-sm font-semibold text-neutral-900 cursor-pointer">
                      Publish to Wholesale Catalog (Active &amp; Available for Resellers)
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-neutral-900 hover:bg-black text-white shadow-xs transition-colors cursor-pointer"
                >
                  {editingProductId ? 'Save Product Changes' : 'Publish Product to Catalog'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This will remove the listing from the wholesale catalog and active reseller storefronts.`}
        confirmText="Delete Product"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
      />

    </div>
  );
}
