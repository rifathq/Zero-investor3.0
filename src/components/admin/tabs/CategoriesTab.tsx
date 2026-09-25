'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  ArrowUp, 
  ArrowDown, 
  MoveVertical, 
  UploadCloud, 
  X, 
  Check, 
  AlertTriangle, 
  Layers, 
  ExternalLink, 
  FolderTree, 
  RefreshCw, 
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Category } from '@/types/marketplace';
import { formatDate } from '@/lib/formatters';

export function CategoriesTab() {
  const { 
    categories, 
    isLoadingCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    reorderCategories, 
    toggleCategoryStatus, 
    toggleCategoryFeatured 
  } = useAdmin();

  const { products, navigate } = useMarketplace();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden' | 'featured'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'products' | 'updated'>('order');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'active' | 'hidden'>('active');
  const [formFeatured, setFormFeatured] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalCategory, setDeleteModalCategory] = useState<Category | null>(null);
  const [moveProductsToCatId, setMoveProductsToCatId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reorder mode state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedList, setReorderedList] = useState<Category[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Calculate live analytics
  const totalCategories = categories.length;
  const activeCategoriesCount = categories.filter(c => c.status !== 'hidden').length;
  const hiddenCategoriesCount = categories.filter(c => c.status === 'hidden').length;
  const featuredCategoriesCount = categories.filter(c => c.isFeatured).length;
  const totalProductsAssigned = useMemo(() => {
    return products.filter(p => p.isActive !== false && (p.category || p.categoryId)).length;
  }, [products]);

  // Filtered & Sorted Categories list
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        // Status filter
        if (statusFilter === 'active' && cat.status === 'hidden') return false;
        if (statusFilter === 'hidden' && cat.status !== 'hidden') return false;
        if (statusFilter === 'featured' && !cat.isFeatured) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = cat.name.toLowerCase().includes(q);
          const matchSlug = cat.slug.toLowerCase().includes(q);
          const matchDesc = (cat.description || '').toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'order') return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'products') return (b.productCount ?? 0) - (a.productCount ?? 0);
        if (sortBy === 'updated') {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        }
        return 0;
      });
  }, [categories, statusFilter, searchQuery, sortBy]);

  // Open modal for new category
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80');
    setFormParentId('');
    setFormSortOrder(categories.length + 1);
    setFormStatus('active');
    setFormFeatured(true);
    setFormErrors({});
    setUploadError(null);
    setIsAddEditModalOpen(true);
  };

  // Open modal for editing category
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormImageUrl(cat.imageUrl || '');
    setFormParentId(cat.parentId || '');
    setFormSortOrder(cat.sortOrder ?? 1);
    setFormStatus(cat.status === 'hidden' ? 'hidden' : 'active');
    setFormFeatured(cat.isFeatured !== false);
    setFormErrors({});
    setUploadError(null);
    setIsAddEditModalOpen(true);
  };

  // Auto-generate slug when name changes (for new category or if slug is empty)
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormSlug(generated);
    }
    if (formErrors.name) {
      setFormErrors(prev => ({ ...prev, name: '' }));
    }
  };

  // Image Upload handler (converts to base64 or reads data url)
  const handleImageUpload = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormImageUrl(result);
        if (formErrors.imageUrl) {
          setFormErrors(prev => ({ ...prev, imageUrl: '' }));
        }
      }
    };
    reader.onerror = () => setUploadError('Failed to read image file');
    reader.readAsDataURL(file);
  };

  // Submit Add or Edit Form
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formName.trim() || formName.trim().length < 2) {
      errors.name = 'Category name is required (min 2 chars)';
    }

    const finalSlug = formSlug.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!finalSlug) {
      errors.slug = 'Valid slug is required';
    }

    if (!formImageUrl.trim()) {
      errors.imageUrl = 'Category image is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmittingForm(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formName.trim(),
          slug: finalSlug,
          description: formDescription.trim(),
          imageUrl: formImageUrl.trim(),
          parentId: formParentId || null,
          sortOrder: Number(formSortOrder) || 1,
          status: formStatus,
          isFeatured: formFeatured
        });
      } else {
        await addCategory({
          name: formName.trim(),
          slug: finalSlug,
          description: formDescription.trim(),
          imageUrl: formImageUrl.trim(),
          iconName: 'Grid',
          parentId: formParentId || null,
          sortOrder: Number(formSortOrder) || (categories.length + 1),
          status: formStatus,
          isFeatured: formFeatured,
          productCount: 0
        });
      }
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      setFormErrors({ form: err.message || 'Operation failed' });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Delete / Archive Category handler
  const handleConfirmDelete = async () => {
    if (!deleteModalCategory) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteModalCategory.id, moveProductsToCatId || undefined);
      setDeleteModalCategory(null);
      setMoveProductsToCatId('');
    } catch (err: any) {
      console.error('Delete category error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Move Up or Down in main list
  const handleQuickMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    await reorderCategories(newOrder.map(c => c.id));
  };

  // Reorder mode toggle
  const handleStartReorder = () => {
    setReorderedList([...categories]);
    setIsReorderMode(true);
  };

  const handleMoveInReorder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reorderedList.length) return;

    const updated = [...reorderedList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setReorderedList(updated);
  };

  const handleSaveReorder = async () => {
    setIsSavingOrder(true);
    try {
      await reorderCategories(reorderedList.map(c => c.id));
      setIsReorderMode(false);
    } catch (err) {
      console.error('Save order error:', err);
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* =========================================================================
          TOP HEADER & METRICS
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Category Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
              {totalCategories} Categories
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Control customer-facing categories, display order, homepage featured placements, and product associations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={isReorderMode ? () => setIsReorderMode(false) : handleStartReorder}
            className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
              isReorderMode 
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <MoveVertical className="w-4 h-4" />
            <span>{isReorderMode ? 'Cancel Reordering' : 'Reorder Categories'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ANALYTICS KPI CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Categories</span>
          <div className="text-2xl font-extrabold text-neutral-900 mt-1">{totalCategories}</div>
          <span className="text-[11px] text-neutral-500">Platform catalog</span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Active</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{activeCategoriesCount}</div>
          <span className="text-[11px] text-neutral-500">Visible to customers</span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Hidden / Draft</span>
          <div className="text-2xl font-extrabold text-neutral-600 mt-1">{hiddenCategoriesCount}</div>
          <span className="text-[11px] text-neutral-500">Archived from shop</span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Featured</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{featuredCategoriesCount}</div>
          <span className="text-[11px] text-neutral-500">Homepage carousel</span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Products Assigned</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{totalProductsAssigned}</div>
          <span className="text-[11px] text-neutral-500">Active products mapped</span>
        </div>
      </div>

      {/* =========================================================================
          REORDER DRAWER / ALERT (IF IN REORDER MODE)
         ========================================================================= */}
      {isReorderMode && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <MoveVertical className="w-4 h-4 text-amber-700" />
                <span>Reorder Customer Display Sequence</span>
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Use the Up and Down controls to sequence categories. The exact sequence shown here will immediately display on the customer homepage &quot;Explore by Category&quot; carousel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReorderMode(false)}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingOrder}
                onClick={handleSaveReorder}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingOrder ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save New Order</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {reorderedList.map((cat, idx) => (
              <div
                key={cat.id}
                className="bg-white border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveInReorder(idx, 'up')}
                    className="p-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === reorderedList.length - 1}
                    onClick={() => handleMoveInReorder(idx, 'down')}
                    className="p-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TOOLBAR: SEARCH + FILTERS + SORT
         ========================================================================= */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category by name, slug or description..."
              className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/70 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="inline-flex items-center rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All ({totalCategories})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Active ({activeCategoriesCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('hidden')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'hidden' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Hidden ({hiddenCategoriesCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('featured')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'featured' ? 'bg-white text-amber-700 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Featured ({featuredCategoriesCount})
              </button>
            </div>

            {/* Sort by dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="order">Display Order (#1, #2...)</option>
                <option value="name">Name (A-Z)</option>
                <option value="products">Product Count (High to Low)</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          CATEGORIES LIST / TABLE
         ========================================================================= */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs">
        {isLoadingCategories ? (
          /* Loading Skeletons */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
                <div className="w-20 h-6 bg-neutral-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">No categories found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'No categories match the active filter criteria. Try clearing search or switching filters.'
                : 'Get started by creating your first platform category for product assignment.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Category</span>
              </button>
            </div>
          </div>
        ) : (
          /* Category Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Category Details</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-neutral-400">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCategories.map((cat, index) => {
                  const parentCat = cat.parentId ? categories.find(c => c.id === cat.parentId) : null;
                  const isHidden = cat.status === 'hidden';

                  return (
                    <tr 
                      key={cat.id} 
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isHidden ? 'bg-neutral-50/30 opacity-75' : ''
                      }`}
                    >
                      {/* 1. Order Number & Quick Arrow Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="font-mono font-bold text-neutral-700 text-xs">
                            #{cat.sortOrder ?? index + 1}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleQuickMove(index, 'up')}
                              className="p-0.5 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                              title="Move up in display order"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === filteredCategories.length - 1}
                              onClick={() => handleQuickMove(index, 'down')}
                              className="p-0.5 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                              title="Move down in display order"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 2. Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0 relative group">
                          {cat.imageUrl ? (
                            <img 
                              src={cat.imageUrl} 
                              alt={cat.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <FolderTree className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. Category Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm">
                              {cat.name}
                            </span>
                            <span className="font-mono text-[11px] text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded">
                              /category/{cat.slug}
                            </span>
                          </div>

                          {cat.description && (
                            <p className="text-[11.5px] text-neutral-500 line-clamp-1">
                              {cat.description}
                            </p>
                          )}

                          {parentCat && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                              <span>Subcategory of:</span>
                              <strong>{parentCat.name}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Products Count */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => navigate('shop', { category: cat.name })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
                          title="View products in this category"
                        >
                          <ShoppingBag className="w-3 h-3 text-neutral-500" />
                          <span>{cat.productCount ?? 0}</span>
                        </button>
                      </td>

                      {/* 5. Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCategoryFeatured(cat.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            cat.isFeatured
                              ? 'bg-amber-100 text-amber-900 border border-amber-200/80 hover:bg-amber-200'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                          title={cat.isFeatured ? 'Featured on homepage (click to unfeature)' : 'Standard category (click to feature)'}
                        >
                          <Star className={`w-3 h-3 ${cat.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`} />
                          <span>{cat.isFeatured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* 6. Active / Hidden Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCategoryStatus(cat.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            cat.status !== 'hidden'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-300'
                          }`}
                          title={cat.status !== 'hidden' ? 'Active on store (click to hide)' : 'Hidden from store (click to activate)'}
                        >
                          {cat.status !== 'hidden' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-neutral-500" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 7. Last Updated */}
                      <td className="py-3 px-4 text-neutral-500 text-[11px]">
                        {formatDate(cat.updatedAt || cat.createdAt)}
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate('shop', { category: cat.name })}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Open customer view"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit category details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModalCategory(cat)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete or archive category"
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

      {/* =========================================================================
          MODAL 1: ADD OR EDIT CATEGORY
         ========================================================================= */}
      {isAddEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsAddEditModalOpen(false)}
        >
          <div 
            className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-neutral-200 relative overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure visual assets, slug, hierarchy, and homepage presentation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCategory} className="overflow-y-auto flex-1 p-6 space-y-5">
              {formErrors.form && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {formErrors.form}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Category Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Smart Watches &amp; Audio"
                    className={`w-full h-11 px-3.5 bg-neutral-50 border ${
                      formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-neutral-200'
                    } rounded-xl text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-0.5">{formErrors.name}</p>}
                </div>

                {/* Category Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-neutral-400 text-xs font-mono">/r/</span>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                      placeholder="electronics"
                      className="w-full h-11 pl-9 pr-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                  {formErrors.slug && <p className="text-xs text-red-500 mt-0.5">{formErrors.slug}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Minimalist decor, furniture, candles, and kitchenware."
                    className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>

                {/* Category Image Upload & Preview */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-neutral-700">
                      Category Image (1:1 Ratio Recommended) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-neutral-400 text-[11px]">JPG, PNG, WebP up to 5MB</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    {/* Thumbnail preview */}
                    <div className="relative w-full aspect-square max-w-[120px] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                      {formImageUrl ? (
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Upload actions */}
                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4 text-neutral-600" />
                          <span>Upload From Computer</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400 block font-medium">Or enter image web URL:</span>
                        <input
                          type="url"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full h-9 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-800 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                  {formErrors.imageUrl && <p className="text-xs text-red-500">{formErrors.imageUrl}</p>}
                </div>

                {/* Parent Category (for subcategories) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Parent Category
                  </label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter(c => !editingCategory || c.id !== editingCategory.id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Display Order (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Storefront Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus('active')}
                      className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        formStatus === 'active'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('hidden')}
                      className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        formStatus === 'hidden'
                          ? 'bg-neutral-800 border-neutral-800 text-white shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </button>
                  </div>
                </div>

                {/* Featured Category Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Homepage Carousel
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormFeatured(!formFeatured)}
                    className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formFeatured
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${formFeatured ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`} />
                    <span>{formFeatured ? 'Featured on Homepage' : 'Standard (All Categories Only)'}</span>
                  </button>
                </div>

              </div>

              {/* Live Customer Preview Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Customer Card Live Preview</span>
                </span>
                <div className="max-w-[200px] bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-2xs text-center flex flex-col items-center mx-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 mb-2.5">
                    <img src={formImageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80'} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 line-clamp-1">{formName || 'Category Name'}</span>
                  <span className="text-[11px] text-neutral-400 font-medium">48 items</span>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingForm ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Category...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SAFE DELETE / ARCHIVE CATEGORY
         ========================================================================= */}
      {deleteModalCategory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDeleteModalCategory(null)}
        >
          <div 
            className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Manage Category &quot;{deleteModalCategory.name}&quot;
              </h3>
              {deleteModalCategory.productCount && deleteModalCategory.productCount > 0 ? (
                <div className="mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>This category contains {deleteModalCategory.productCount} active products.</span>
                  </p>
                  <p className="text-amber-800">
                    To prevent broken storefront links and missing catalog items, we recommend archiving (hiding) this category or moving its products to another category first.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-1">
                  This category contains 0 products and can be safely deleted permanently.
                </p>
              )}
            </div>

            {/* Move Products Dropdown if products exist */}
            {deleteModalCategory.productCount && deleteModalCategory.productCount > 0 ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Reassign products to another category (optional):
                  </label>
                  <select
                    value={moveProductsToCatId}
                    onChange={(e) => setMoveProductsToCatId(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="">Do not move (keep current categoryId on products)</option>
                    {categories
                      .filter(c => c.id !== deleteModalCategory.id && c.status !== 'hidden')
                      .map(c => (
                        <option key={c.id} value={c.id}>Move all to: {c.name}</option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {/* Preferred Option: Archive / Hide */}
                  <button
                    type="button"
                    onClick={async () => {
                      await toggleCategoryStatus(deleteModalCategory.id);
                      setDeleteModalCategory(null);
                    }}
                    className="w-full h-11 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Archive / Hide Category (Recommended)</span>
                  </button>

                  {/* Move Products and Delete */}
                  {moveProductsToCatId && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleConfirmDelete}
                      className="w-full h-10 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isDeleting ? 'Reassigning & Deleting...' : 'Move Products & Delete Category'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteModalCategory(null)}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 py-1.5 transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* No Products - Safe permanent deletion */
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalCategory(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
