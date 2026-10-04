"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Search, Check, Upload, Image as ImageIcon, Loader2, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { ImageCode, ImageCategory } from "@/modules/products/types/imageCode";
import {
  getSalesImageCodes,
  getSalesImageCategories,
} from "../services/salesImageCode.service";

interface ImageGalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowIndex: number | null;
  productName?: string;
  onSelectImage: (idx: number, item: ImageCode) => void;
  onUploadCustomImage?: (idx: number, file: File) => Promise<void>;
  onSetPendingArtwork?: (idx: number) => void;
  currentSelectedId?: number;
}

export default function ImageGalleryPickerModal({
  isOpen,
  onClose,
  rowIndex,
  productName,
  onSelectImage,
  onUploadCustomImage,
  onSetPendingArtwork,
  currentSelectedId,
}: ImageGalleryPickerModalProps) {
  const [imageCodes, setImageCodes] = useState<ImageCode[]>([]);
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(currentSelectedId || null);

  const [search, setSearch] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load active categories on mount
  useEffect(() => {
    if (isOpen) {
      getSalesImageCategories({ is_active: true })
        .then((data) => setCategories(data || []))
        .catch(console.error);
    }
  }, [isOpen]);

  // Fetch image codes using sales API
  useEffect(() => {
    if (!isOpen) return;

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getSalesImageCodes({
          search: search.trim() || undefined,
          category_name: selectedCategoryName || undefined,
          page_size: 24,
        });
        setImageCodes(res.items || []);
      } catch (err) {
        console.error("Failed to load gallery codes:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  }, [isOpen, search, selectedCategoryName]);

  useEffect(() => {
    setSelectedId(currentSelectedId || null);
  }, [currentSelectedId, isOpen]);

  if (!isOpen || rowIndex === null) return null;

  const selectedItem = imageCodes.find((item) => item.id === selectedId);

  const handleConfirmUse = () => {
    if (!selectedItem) return;
    onSelectImage(rowIndex, selectedItem);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadCustomImage) return;

    setIsUploading(true);
    try {
      await onUploadCustomImage(rowIndex, file);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePendingClick = () => {
    if (onSetPendingArtwork) {
      onSetPendingArtwork(rowIndex);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Choose Artwork / Image Code
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Item #{rowIndex + 1} {productName ? `· ${productName}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by code (e.g. ABC123) or artwork name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-600"
              autoFocus
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </div>

          <div>
            <select
              value={selectedCategoryName}
              onChange={(e) => setSelectedCategoryName(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Loading catalog image codes...</span>
            </div>
          ) : imageCodes.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <ImageIcon size={28} className="text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No artwork images found.</p>
              <p className="text-[11px] text-slate-400">Try searching for a different code or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imageCodes.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`border rounded-xl p-2.5 flex flex-col gap-2 cursor-pointer transition-all bg-white hover:shadow-sm ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-full h-32 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-100 flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.image_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/150x150?text=Image";
                          }}
                        />
                      ) : (
                        <ImageIcon size={20} className="text-slate-400" />
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200/80 px-1.5 py-0.5 rounded">
                          #{item.image_code}
                        </span>
                        {item.category_name && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                            {item.category_name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate" title={item.image_name}>
                        {item.image_name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Upload & Actions Bar */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Fallback actions */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            {onUploadCustomImage && (
              <button
                type="button"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 size={13} className="animate-spin text-indigo-600" />
                ) : (
                  <Upload size={13} />
                )}
                <span>Upload customer artwork</span>
              </button>
            )}

            {onSetPendingArtwork && (
              <button
                type="button"
                onClick={handlePendingClick}
                className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer border-l border-slate-200 pl-3"
              >
                <Clock size={13} />
                <span>Artwork will be provided later</span>
              </button>
            )}
          </div>

          {/* Confirm Selection */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirmUse}
              className="flex items-center gap-1.5"
            >
              <Check size={14} /> Use This Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
