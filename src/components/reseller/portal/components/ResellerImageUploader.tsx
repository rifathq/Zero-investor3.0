'use client';

import React, { useState, useRef } from 'react';
import { mediaService } from '@/services/mediaService';
import { Upload, X, Star, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ResellerImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ResellerImageUploader({
  images,
  onChange,
  maxImages = 5
}: ResellerImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directUrl, setDirectUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
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
    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const validation = mediaService.validateImageFile(file);
        if (!validation.valid) {
          setErrorMessage(validation.error || 'Invalid file format or size exceeds 5MB.');
          continue;
        }

        const result = await mediaService.uploadImage(file, (percent) => {
          const overall = Math.round(((i + percent / 100) / filesToUpload.length) * 100);
          setUploadProgress(overall);
        });

        uploadedUrls.push(result.url);
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleAddDirectUrl = () => {
    if (!directUrl.trim()) return;
    if (images.length >= maxImages) {
      setErrorMessage(`Maximum ${maxImages} images allowed.`);
      return;
    }
    onChange([...images, directUrl.trim()]);
    setDirectUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800">
          Product Images ({images.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
        >
          {showUrlInput ? 'Hide URL input' : '+ Add via URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-300 hover:border-neutral-400 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {isUploading ? (
            <div className="space-y-2 py-2">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-700 mx-auto" />
              <p className="text-xs font-semibold text-neutral-700">Uploading images... {uploadProgress}%</p>
              <div className="w-36 h-1.5 bg-neutral-200 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-neutral-900 transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-neutral-900">
                Click or drag images here to upload
              </p>
              <p className="text-[11px] text-neutral-500">
                Supports JPG, PNG, WebP up to 5 MB per image (Max {maxImages} images)
              </p>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg">
          {errorMessage}
        </p>
      )}

      {/* Uploaded Images Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {images.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square shadow-xs"
            >
              <img
                src={img}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Primary Image Badge */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-neutral-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide flex items-center gap-1 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Cover
                </div>
              )}

              {/* Action Overlays */}
              <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1 text-[10px] text-white">
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(idx, 'up');
                        }}
                        className="p-1 rounded bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                        title="Move left/up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(idx, 'down');
                        }}
                        className="p-1 rounded bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                        title="Move right/down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[9px] font-semibold cursor-pointer"
                      title="Set as primary cover"
                    >
                      Make Cover
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
