import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { Category } from '@/types/marketplace';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/mockData';

const LOCAL_STORAGE_KEY = 'zero_invest_categories_v2';

/**
 * Loads categories from local storage or defaults
 */
function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    }
  } catch (err) {
    console.warn('[CategoryService] Failed to read localStorage:', err);
  }
  return DEFAULT_CATEGORIES;
}

/**
 * Persists categories to local storage
 */
function saveLocalCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('zero_invest_categories_updated', { detail: categories }));
  } catch (err) {
    console.warn('[CategoryService] Failed to write localStorage:', err);
  }
}

/**
 * Category Service for Firestore and Local State Synchronization
 */
export const categoryService = {
  /**
   * Subscribes to real-time category updates.
   * If Firestore is active, uses onSnapshot. Also auto-seeds defaults if empty.
   * Otherwise, listens to local window storage events.
   */
  subscribe(
    onUpdate: (categories: Category[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    // 1. Send initial local/cached data immediately so UI never flickers
    const initial = getLocalCategories();
    onUpdate(initial);

    // 2. If Firebase is active and db is available, hook up Firestore
    if (isFirebaseConfigured && db) {
      try {
        const catCol = collection(db, 'categories');
        const catQuery = query(catCol, orderBy('sortOrder', 'asc'));

        const unsubscribe = onSnapshot(
          catQuery,
          async (snapshot) => {
            if (snapshot.empty) {
              console.info('[CategoryService] Firestore categories collection empty. Seeding defaults...');
              // Auto-seed defaults into Firestore
              try {
                const batch = writeBatch(db!);
                const defaultCats = getLocalCategories();
                defaultCats.forEach((cat) => {
                  const docRef = doc(catCol, cat.id);
                  batch.set(docRef, {
                    ...cat,
                    createdAt: cat.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                });
                await batch.commit();
                console.info('[CategoryService] Seeded default categories to Firestore.');
              } catch (seedErr) {
                console.warn('[CategoryService] Auto-seed warning:', seedErr);
              }
              return;
            }

            const firestoreCategories = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                name: data.name || '',
                slug: data.slug || docSnap.id.replace(/^cat-/, ''),
                description: data.description || '',
                imageUrl: data.imageUrl || '',
                iconName: data.iconName || 'Grid',
                icon: data.icon || '',
                status: data.status || 'active',
                isFeatured: data.isFeatured !== false,
                sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 99,
                parentId: data.parentId || null,
                productCount: data.productCount || 0,
                subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              } as Category;
            });

            // Sort by sortOrder
            firestoreCategories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

            // Sync to local storage
            saveLocalCategories(firestoreCategories);
            onUpdate(firestoreCategories);
          },
          (err) => {
            console.warn('[CategoryService] Firestore onSnapshot warning:', err);
            if (onError) onError(err);
            // Fall back to local
            onUpdate(getLocalCategories());
          }
        );

        return () => unsubscribe();
      } catch (err: any) {
        console.warn('[CategoryService] Failed to establish listener, falling back to local:', err);
      }
    }

    // Fallback: Listen to custom window events for tab/component sync
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Category[]>;
      if (customEvent.detail) {
        onUpdate(customEvent.detail);
      } else {
        onUpdate(getLocalCategories());
      }
    };

    window.addEventListener('zero_invest_categories_updated', handleLocalUpdate);
    return () => {
      window.removeEventListener('zero_invest_categories_updated', handleLocalUpdate);
    };
  },

  /**
   * Creates a new category
   */
  async createCategory(
    categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Category> {
    const slug = (categoryData.slug || categoryData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const id = `cat-${slug || Date.now()}`;
    const now = new Date().toISOString();

    const newCategory: Category = {
      ...categoryData,
      id,
      slug,
      status: categoryData.status || 'active',
      isFeatured: categoryData.isFeatured ?? true,
      sortOrder: categoryData.sortOrder ?? (getLocalCategories().length + 1),
      parentId: categoryData.parentId || null,
      productCount: categoryData.productCount || 0,
      createdAt: now,
      updatedAt: now
    };

    // Update local storage first for snappy UI
    const current = getLocalCategories();
    const updated = [...current, newCategory].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    saveLocalCategories(updated);

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'categories', id);
        await setDoc(docRef, {
          ...newCategory,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('[CategoryService] Firestore createCategory error:', err);
      }
    }

    return newCategory;
  },

  /**
   * Updates an existing category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const now = new Date().toISOString();
    const current = getLocalCategories();
    const updated = current.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: now
        };
      }
      return c;
    }).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    saveLocalCategories(updated);

    // Save to Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'categories', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('[CategoryService] Firestore updateCategory error:', err);
      }
    }
  },

  /**
   * Deletes a category permanently
   */
  async deleteCategory(id: string): Promise<void> {
    const current = getLocalCategories();
    const updated = current.filter((c) => c.id !== id);
    saveLocalCategories(updated);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'categories', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[CategoryService] Firestore deleteCategory error:', err);
      }
    }
  },

  /**
   * Reorders categories by array of IDs
   */
  async reorderCategories(orderedIds: string[]): Promise<void> {
    const current = getLocalCategories();
    const categoryMap = new Map(current.map((c) => [c.id, c]));

    const reordered: Category[] = [];
    const now = new Date().toISOString();

    orderedIds.forEach((id, index) => {
      const cat = categoryMap.get(id);
      if (cat) {
        reordered.push({
          ...cat,
          sortOrder: index + 1,
          updatedAt: now
        });
        categoryMap.delete(id);
      }
    });

    // Append any remaining categories
    Array.from(categoryMap.values()).forEach((cat, index) => {
      reordered.push({
        ...cat,
        sortOrder: reordered.length + index + 1,
        updatedAt: now
      });
    });

    saveLocalCategories(reordered);

    // Batch update Firestore
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        reordered.forEach((cat) => {
          const docRef = doc(db!, 'categories', cat.id);
          batch.update(docRef, {
            sortOrder: cat.sortOrder,
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      } catch (err) {
        console.warn('[CategoryService] Firestore reorder batch error:', err);
      }
    }
  },

  /**
   * Quick toggle between 'active' and 'hidden'
   */
  async toggleCategoryStatus(id: string, currentStatus?: 'active' | 'hidden'): Promise<'active' | 'hidden'> {
    const nextStatus = currentStatus === 'hidden' ? 'active' : 'hidden';
    await this.updateCategory(id, { status: nextStatus });
    return nextStatus;
  },

  /**
   * Quick toggle for featured status
   */
  async toggleCategoryFeatured(id: string, currentFeatured?: boolean): Promise<boolean> {
    const nextFeatured = !currentFeatured;
    await this.updateCategory(id, { isFeatured: nextFeatured });
    return nextFeatured;
  }
};
