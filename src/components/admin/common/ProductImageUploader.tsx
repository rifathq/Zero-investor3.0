'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  AlertCircle, 
  Image as ImageIcon,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { mediaService } from '@/services/mediaService';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ProductImageUploader({
  images,
  onChange,
  maxImages = 5
}: ProductImageUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      setErrorMessage(`Only ${availableSlots} more image(s) could be added (max ${maxImages}).`);
    }

    const newImageUrls: string[] = [];

    for (const file of filesToUpload) {
      const validation = mediaService.validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid image file.');
        continue;
      }

      try {
        setUploadProgress(10);
        const result = await mediaService.uploadImage(file, (progress) => {
          setUploadProgress(progress);
        });
        newImageUrls.push(result.url);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to upload image.');
      } finally {
        setUploadProgress(null);
      }
    }

    if (newImageUrls.length > 0) {
      onChange([...images, ...newImageUrls]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddViaUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setErrorMessage(null);

    if (images.length >= maxImages) {
      setErrorMessage(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    const trimmed = urlInput.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    const updated = mediaService.removeImage(images, index);
    onChange(updated);
    setErrorMessage(null);
  };

  const handleSetPrimary = (index: number) => {
    const updated = mediaService.setPrimary(images, index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = mediaService.reorderImages(images, index, targetIndex);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-semibold text-neutral-900">
            Product Media Gallery
          </label>
          <p className="text-xs text-neutral-500">
            Upload up to {maxImages} high-resolution photos. First image serves as the primary storefront cover.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">
            {images.length} of {maxImages} images
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{showUrlInput ? 'Cancel URL' : 'Add by URL'}</span>
          </button>
        </div>
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <form onSubmit={handleAddViaUrl} className="flex gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Add Image
          </button>
        </form>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-600 font-medium">
            <span>Processing image...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-neutral-900 h-1.5 rounded-full transition-all duration-200" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {images.map((imgUrl, index) => {
          const isPrimary = index === 0;
          return (
            <div
              key={`${imgUrl}-${index}`}
              className={`group relative rounded-xl border overflow-hidden bg-neutral-50 aspect-square flex flex-col justify-between transition-all ${
                isPrimary 
                  ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs' 
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {/* Image Preview */}
              <img
                src={imgUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                }}
              />

              {/* Primary Label */}
              {isPrimary && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    Cover
                  </span>
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                <div className="flex items-center justify-between">
                  {!isPrimary ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      title="Set as Cover Image"
                      className="p-1 rounded-md bg-white/90 hover:bg-white text-neutral-800 text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                      <span>Set Cover</span>
                    </button>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Remove image"
                    className="p-1 rounded-md bg-white/90 hover:bg-rose-500 hover:text-white text-rose-600 transition-colors cursor-pointer ml-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reordering Controls */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'left')}
                    title="Move Left"
                    className="p-1 rounded-md bg-white/90 hover:bg-white text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-white px-1">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, 'right')}
                    title="Move Right"
                    className="p-1 rounded-md bg-white/90 hover:bg-white text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Upload Slot / Button */}
        {images.length < maxImages && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-neutral-900 bg-neutral-100' 
                : 'border-neutral-300 hover:border-neutral-500 bg-[#FAF9F5] hover:bg-white'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 mb-2 shadow-2xs">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-neutral-800">
              Add Photo
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5">
              JPG, PNG, WebP
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
