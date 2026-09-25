'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerProduct } from '@/types/reseller';
import { Product } from '@/types/marketplace';
import { ConfirmDialog } from '@/components/admin/common/ConfirmDialog';
import { 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Package, 
  TrendingUp, 
  DollarSign, 
  X, 
  Loader2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerProductsTab() {
  const { 
    products, 
    addCatalogProductToStore,
    updateProduct, 
    deleteProduct, 
    toggleProductStatus,
    isSubmitting 
  } = useReseller();
  const { products: platformCatalog = [], categories, showToast } = useMarketplace();

  // Search & Filter state for Reseller's Active Store Products
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');

  // "Add from Catalog" Modal State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');

  // Selected catalog product for price configuration (either from catalog browser or table edit)
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(null);
  const [configuredSellingPrice, setConfiguredSellingPrice] = useState<number>(0);

  // Edit Selling Price Modal for products already in store
  const [editingStoreProduct, setEditingStoreProduct] = useState<ResellerProduct | null>(null);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);

  // Delete confirm dialog
  const [productToDelete, setProductToDelete] = useState<ResellerProduct | null>(null);

  // Open "Add from Catalog" Modal
  const openCatalogModal = () => {
    setCatalogSearch('');
    setCatalogCategory('all');
    setSelectedCatalogProduct(null);
    setIsCatalogModalOpen(true);
  };

  // Open Price Configuration for a catalog product
  const handleSelectProductForStore = (prod: Product) => {
    setSelectedCatalogProduct(prod);
    const existing = products.find(p => p.originalProductId === prod.id || p.productId === prod.id);
    const initialPrice = existing 
      ? (existing.suggestedPrice || existing.sellingPrice || prod.suggestedPrice || prod.price)
      : (prod.suggestedPrice || prod.price);
    setConfiguredSellingPrice(initialPrice);
  };

  // Save selected catalog product with reseller's selling price
  const handleSaveCatalogProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogProduct) return;

    const baseCost = selectedCatalogProduct.supplierPrice || selectedCatalogProduct.price;
    if (configuredSellingPrice <= 0) {
      showToast('Validation Error', 'Please enter a valid selling price.', 'error');
      return;
    }

    if (configuredSellingPrice < baseCost) {
      showToast('Pricing Notice', `Selling price is below wholesale base cost (৳${baseCost}).`, 'info');
    }

    const res = await addCatalogProductToStore(selectedCatalogProduct.id, configuredSellingPrice);
    if (res.success) {
      setSelectedCatalogProduct(null);
      setIsCatalogModalOpen(false);
    }
  };

  // Open Edit Selling Price for a product already in the store table
  const openEditPriceModal = (prod: ResellerProduct) => {
    setEditingStoreProduct(prod);
    const currentPrice = prod.suggestedPrice || prod.sellingPrice || prod.resellerPrice;
    setEditSellingPrice(currentPrice);
  };

  // Save updated selling price
  const handleSaveSellingPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreProduct) return;

    const baseCost = editingStoreProduct.resellerPrice || editingStoreProduct.baseCost || 0;
    if (editSellingPrice <= 0) {
      showToast('Validation Error', 'Selling price must be greater than zero.', 'error');
      return;
    }

    if (editSellingPrice < baseCost) {
      showToast('Pricing Notice', `Selling price is below base cost (৳${baseCost}).`, 'info');
    }

    await updateProduct(editingStoreProduct.id, {
      suggestedPrice: editSellingPrice,
      sellingPrice: editSellingPrice,
      sellingPriceBDT: editSellingPrice
    });

    setEditingStoreProduct(null);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete.id);
    setProductToDelete(null);
  };

  // Filter store products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.productName.toLowerCase().includes(q);
        const matchCat = (prod.category || '').toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      if (categoryFilter !== 'all' && prod.category !== categoryFilter) {
        return false;
      }

      if (statusFilter === 'active' && !prod.isActive) return false;
      if (statusFilter === 'inactive' && prod.isActive) return false;

      if (stockFilter === 'in_stock' && (prod.stock || 0) <= 0) return false;
      if (stockFilter === 'low_stock' && ((prod.stock || 0) > 10 || (prod.stock || 0) === 0)) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter]);

  // Filter available catalog products
  const filteredCatalog = useMemo(() => {
    return platformCatalog.filter((prod) => {
      if (prod.isActive === false) return false;

      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchCat = (prod.category || '').toLowerCase().includes(q);
        const matchDesc = (prod.description || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      if (catalogCategory !== 'all' && prod.category !== catalogCategory) {
        return false;
      }

      return true;
    });
  }, [platformCatalog, catalogSearch, catalogCategory]);

  const uniqueStoreCategories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  const uniqueCatalogCategories = useMemo(() => {
    const set = new Set(platformCatalog.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }, [platformCatalog]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">My Store Products</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Add approved products from the platform catalog and customize only your customer selling price ({products.length} active in store)
          </p>
        </div>

        {/* Strict Reseller Action: "Add from Catalog" */}
        <button
          onClick={openCatalogModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all cursor-pointer self-start sm:self-auto shadow-2xs active:scale-[0.99]"
        >
          <Layers className="w-4.5 h-4.5" /> Add from Catalog
        </button>
      </div>

      {/* Filter and Search Bar for Reseller Store Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search your store products by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {uniqueStoreCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="low_stock">Low Stock (1 - 10)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Store Products Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 px-4">
            <Package className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-semibold text-neutral-800">No products configured in your store</p>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Select verified wholesale products from the platform catalog to set your selling price and begin selling.
            </p>
            <button
              onClick={openCatalogModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
            >
              <Layers className="w-4 h-4" /> Browse Platform Catalog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E4E0] text-neutral-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="py-4 px-5">Platform Product</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5 text-right">Base Cost</th>
                  <th className="py-4 px-5 text-right">Selling Price</th>
                  <th className="py-4 px-5 text-right">Your Profit</th>
                  <th className="py-4 px-5 text-center">Platform Stock</th>
                  <th className="py-4 px-5 text-center">Store Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((prod) => {
                  const baseCost = prod.resellerPrice || prod.baseCost || 0;
                  const currentSellingPrice = prod.suggestedPrice || prod.sellingPrice || baseCost;
                  const profit = Math.max(0, currentSellingPrice - baseCost);
                  const marginPct = currentSellingPrice > 0 ? Math.round((profit / currentSellingPrice) * 100) : 0;
                  const stockCount = prod.stock !== undefined ? prod.stock : 25;

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Product details (Admin managed) */}
                      <td className="py-4.5 sm:py-5 px-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={prod.imageUrl}
                            alt={prod.productName}
                            className="w-13 h-13 rounded-xl object-cover border border-neutral-200 bg-neutral-100 shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0 max-w-sm">
                            <h4 className="font-bold text-sm sm:text-base text-neutral-900 truncate">{prod.productName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-neutral-400 font-mono">Catalog ID: {(prod.originalProductId || prod.id).slice(-8)}</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Verified Catalog</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category (Admin managed) */}
                      <td className="py-4.5 sm:py-5 px-5 text-neutral-700 font-medium text-sm">
                        {prod.category}
                      </td>

                      {/* Base Cost (Platform Wholesale) */}
                      <td className="py-4.5 sm:py-5 px-5 text-right font-medium text-neutral-600 text-sm">
                        {formatBDT(baseCost)}
                      </td>

                      {/* Selling Price (Reseller configured) */}
                      <td className="py-4.5 sm:py-5 px-5 text-right font-extrabold text-neutral-900 text-sm sm:text-base">
                        {formatBDT(currentSellingPrice)}
                      </td>

                      {/* Profit (sellingPrice - baseCost) */}
                      <td className="py-4.5 sm:py-5 px-5 text-right">
                        <span className="font-extrabold text-emerald-600 text-sm sm:text-base">+{formatBDT(profit)}</span>
                        <span className="block text-xs text-neutral-400 font-medium">({marginPct}% margin)</span>
                      </td>

                      {/* Platform Stock (Live sync) */}
                      <td className="py-4.5 sm:py-5 px-5 text-center">
                        <span className={`font-bold text-sm sm:text-base ${stockCount <= 5 ? 'text-rose-600' : 'text-neutral-800'}`}>
                          {stockCount}
                        </span>
                        {stockCount <= 5 && (
                          <span className="block text-[10px] font-bold text-rose-500 uppercase mt-0.5">Low Stock</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4.5 sm:py-5 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleProductStatus(prod.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                            prod.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                          }`}
                        >
                          {prod.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-neutral-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 sm:py-5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPriceModal(prod)}
                            className="p-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit Selling Price"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove from Store"
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
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: "ADD FROM CATALOG" (Browse Platform Products) */}
      {/* ========================================================================= */}
      {isCatalogModalOpen && !selectedCatalogProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-neutral-900">Add from Platform Catalog</h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                    Wholesale Sourced
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Choose approved platform products to add to your storefront. You only configure your selling price.
                </p>
              </div>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search catalog products..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="px-4 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                {uniqueCatalogCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Catalog Grid */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {filteredCatalog.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Package className="w-10 h-10 text-neutral-300 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-700">No platform products match your query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCatalog.map((prod) => {
                    const baseCost = prod.supplierPrice || prod.price;
                    const existingInStore = products.find(
                      p => p.originalProductId === prod.id || p.productId === prod.id
                    );
                    const currentSellingPrice = existingInStore 
                      ? (existingInStore.suggestedPrice || existingInStore.sellingPrice)
                      : (prod.suggestedPrice || prod.price);

                    return (
                      <div
                        key={prod.id}
                        className="border border-[#E6E4E0] rounded-2xl p-4 bg-white hover:border-neutral-400 transition-all flex flex-col justify-between shadow-2xs group"
                      >
                        <div className="space-y-3">
                          {/* Image container */}
                          <div className="aspect-square w-full rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 relative">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {existingInStore && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white shadow-xs">
                                In Store
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              {prod.category}
                            </span>
                            <h4 className="font-bold text-sm text-neutral-900 line-clamp-2 mt-0.5">
                              {prod.name}
                            </h4>
                          </div>

                          {/* Pricing details */}
                          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-neutral-600">
                              <span>Base Cost:</span>
                              <span className="font-bold text-neutral-900">{formatBDT(baseCost)}</span>
                            </div>
                            {existingInStore ? (
                              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                                <span>Your Selling Price:</span>
                                <span>{formatBDT(currentSellingPrice)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-neutral-500">
                                <span>Suggested Retail:</span>
                                <span className="font-semibold text-neutral-700">{formatBDT(prod.suggestedPrice || prod.price)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => handleSelectProductForStore(prod)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              existingInStore
                                ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                                : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xs'
                            }`}
                          >
                            {existingInStore ? (
                              <>
                                <Edit className="w-3.5 h-3.5" /> Update Selling Price
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" /> Add to Store
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-5 py-2.5 border border-neutral-300 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Close Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIGURE SELLING PRICE FOR CATALOG PRODUCT (Strict: Price Only) */}
      {/* ========================================================================= */}
      {selectedCatalogProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Configure Selling Price</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Set the retail price your customers will pay</p>
              </div>
              <button
                onClick={() => setSelectedCatalogProduct(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Product Summary */}
            <div className="flex gap-4 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 items-center">
              <img
                src={selectedCatalogProduct.imageUrl}
                alt={selectedCatalogProduct.name}
                className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#C98F6B] uppercase tracking-wider">
                  {selectedCatalogProduct.category}
                </span>
                <h4 className="font-bold text-sm text-neutral-900 truncate">
                  {selectedCatalogProduct.name}
                </h4>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Platform Wholesale Base Cost: <span className="font-bold text-neutral-800">{formatBDT(selectedCatalogProduct.supplierPrice || selectedCatalogProduct.price)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCatalogProduct} className="space-y-5">
              {/* The ONLY editable field: Selling Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                  Your Selling Price (৳) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-neutral-400 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={configuredSellingPrice || ''}
                    onChange={(e) => setConfiguredSellingPrice(Number(e.target.value))}
                    placeholder="Enter retail price..."
                    className="w-full pl-9 pr-4 py-3 text-base font-extrabold text-neutral-900 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-neutral-500 block">
                  Customer will see and pay this exact price on your storefront.
                </span>
              </div>

              {/* Live Profit Calculation Card */}
              {(() => {
                const baseCost = selectedCatalogProduct.supplierPrice || selectedCatalogProduct.price;
                const profit = Math.max(0, configuredSellingPrice - baseCost);
                const marginPct = configuredSellingPrice > 0 ? Math.round((profit / configuredSellingPrice) * 100) : 0;

                return (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-900 font-medium">
                      <span>Wholesale Base Cost:</span>
                      <span className="font-bold">{formatBDT(baseCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-900 font-medium">
                      <span>Your Selling Price:</span>
                      <span className="font-bold">{formatBDT(configuredSellingPrice)}</span>
                    </div>
                    <div className="border-t border-emerald-200/80 pt-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-950 text-sm">Your Profit Margin:</span>
                        <span className="block text-[11px] text-emerald-700">Earned upon successful order delivery</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-emerald-700">+{formatBDT(profit)}</span>
                        <span className="block text-[10px] font-bold text-emerald-600">({marginPct}% margin)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedCatalogProduct(null)}
                  className="px-4.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Back to Catalog
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save / Update Selling Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT SELLING PRICE (From Table Actions) */}
      {/* ========================================================================= */}
      {editingStoreProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Update Selling Price</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Modify your retail markup for this product</p>
              </div>
              <button
                onClick={() => setEditingStoreProduct(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Product Summary */}
            <div className="flex gap-4 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 items-center">
              <img
                src={editingStoreProduct.imageUrl}
                alt={editingStoreProduct.productName}
                className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#C98F6B] uppercase tracking-wider">
                  {editingStoreProduct.category}
                </span>
                <h4 className="font-bold text-sm text-neutral-900 truncate">
                  {editingStoreProduct.productName}
                </h4>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Platform Wholesale Base Cost: <span className="font-bold text-neutral-800">{formatBDT(editingStoreProduct.resellerPrice || editingStoreProduct.baseCost || 0)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSellingPrice} className="space-y-5">
              {/* ONLY editable field: Selling Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                  Your Selling Price (৳) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-neutral-400 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editSellingPrice || ''}
                    onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 text-base font-extrabold text-neutral-900 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-neutral-500 block">
                  Customer will pay this price at checkout. The platform wholesale cost remains unchanged.
                </span>
              </div>

              {/* Live Profit Calculation Card */}
              {(() => {
                const baseCost = editingStoreProduct.resellerPrice || editingStoreProduct.baseCost || 0;
                const profit = Math.max(0, editSellingPrice - baseCost);
                const marginPct = editSellingPrice > 0 ? Math.round((profit / editSellingPrice) * 100) : 0;

                return (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-900 font-medium">
                      <span>Wholesale Base Cost:</span>
                      <span className="font-bold">{formatBDT(baseCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-900 font-medium">
                      <span>Your Selling Price:</span>
                      <span className="font-bold">{formatBDT(editSellingPrice)}</span>
                    </div>
                    <div className="border-t border-emerald-200/80 pt-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-950 text-sm">Your Profit Margin:</span>
                        <span className="block text-[11px] text-emerald-700">Calculated as: Selling Price - Base Cost</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-emerald-700">+{formatBDT(profit)}</span>
                        <span className="block text-[10px] font-bold text-emerald-600">({marginPct}% margin)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingStoreProduct(null)}
                  className="px-4.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save / Update Selling Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Remove Product from Store?"
        message={`Are you sure you want to remove "${productToDelete?.productName}" from your storefront? You can add it back from the platform catalog anytime.`}
        confirmText="Remove from Store"
        cancelText="Keep in Store"
        variant="danger"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
