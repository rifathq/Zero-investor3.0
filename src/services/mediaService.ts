/**
 * Media Service Abstraction for Product & Marketplace Images
 * Supports:
 * - File validation (type, size <= 5MB)
 * - Firebase Storage upload when configured
 * - Local client preview generation for demo/offline operation
 * - Direct image URL attachment
 * - Image reordering & primary cover selection
 */

import { storage, isFirebaseConfigured } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface MediaUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const mediaService = {
  /**
   * Validates if a file is an acceptable image
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format (${file.type || 'unknown'}). Please upload JPG, PNG, WebP, or GIF images.`
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size (${sizeMB} MB) exceeds maximum allowed limit of 5 MB.`
      };
    }

    return { valid: true };
  },

  /**
   * Uploads an image file with progress callback
   * Real Firebase Storage upload when configured, with persistent Data URL fallback
   */
  async uploadImage(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    // Attempt Firebase Storage upload if configured
    if (isFirebaseConfigured && storage) {
      try {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `products/${Date.now()}_${sanitizedName}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type
        });

        return await new Promise<MediaUploadResult>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(progress);
            },
            (error) => {
              console.warn('[Firebase Storage] Upload error, falling back to persistent Data URL:', error);
              // Fallback to data URL on storage failure
              this.readFileAsDataUrl(file, onProgress)
                .then(resolve)
                .catch(reject);
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                if (onProgress) onProgress(100);
                resolve({
                  url: downloadUrl,
                  name: file.name,
                  size: file.size,
                  type: file.type
                });
              } catch (urlErr) {
                this.readFileAsDataUrl(file, onProgress).then(resolve).catch(reject);
              }
            }
          );
        });
      } catch (storageErr) {
        console.warn('[Firebase Storage] Storage attempt failed:', storageErr);
      }
    }

    // Persistent Base64 Data URL fallback for local / demo / offline use
    return this.readFileAsDataUrl(file, onProgress);
  },

  /**
   * Converts file to persistent base64 data URL
   */
  readFileAsDataUrl(file: File, onProgress?: (progress: number) => void): Promise<MediaUploadResult> {
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(30);
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          url: reader.result as string,
          name: file.name,
          size: file.size,
          type: file.type
        });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file into persistent data URL.'));
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Reorder an image within the array
   */
  reorderImages(images: string[], fromIndex: number, toIndex: number): string[] {
    if (
      fromIndex < 0 || 
      fromIndex >= images.length || 
      toIndex < 0 || 
      toIndex >= images.length || 
      fromIndex === toIndex
    ) {
      return images;
    }

    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  },

  /**
   * Make the selected index the primary (index 0) image
   */
  setPrimary(images: string[], index: number): string[] {
    if (index <= 0 || index >= images.length) return images;
    const next = [...images];
    const [primary] = next.splice(index, 1);
    return [primary, ...next];
  },

  /**
   * Remove an image by index
   */
  removeImage(images: string[], index: number): string[] {
    return images.filter((_, i) => i !== index);
  }
};
