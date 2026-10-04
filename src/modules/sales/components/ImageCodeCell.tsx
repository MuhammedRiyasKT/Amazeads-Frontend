"use client";

import React, { useState, useEffect, useRef } from "react";
import { Images, X, Image as ImageIcon, ZoomIn, Clock, RefreshCw } from "lucide-react";
import { ImageCode } from "@/modules/products/types/imageCode";
import { getSalesImageCodes } from "../services/salesImageCode.service";

interface ImageCodeCellProps {
  index: number;
  row: any;
  onRowChange: (idx: number, field: string, value: any) => void;
  onOpenGallery: (idx: number) => void;
  onPreviewImage?: (data: { url: string; code?: string; name?: string; idx: number }) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

export default function ImageCodeCell({
  index,
  row,
  onRowChange,
  onOpenGallery,
  onPreviewImage,
  isUploading = false,
  disabled = false,
}: ImageCodeCellProps) {
  const [searchQuery, setSearchQuery] = useState(row.image_code || "");
  const [suggestions, setSuggestions] = useState<ImageCode[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rowImages = row.project_images || [];
  const previewUrl = rowImages.length > 0 ? rowImages[0].img_url : null;
  const isLocked = Boolean(row.image_code && row.image_code_id);
  const isCustomerArtwork = !row.image_code && row.image_source === "customer" && Boolean(previewUrl);
  const isPendingArtwork = row.image_source === "pending";
  const isProductSelected = Boolean(row.product_name && row.product_name.trim());
  const isDisabled = disabled || !isProductSelected;

  // Sync external changes
  useEffect(() => {
    setSearchQuery(row.image_code || "");
  }, [row.image_code]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSearchQuery(val);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getSalesImageCodes({ search: val.trim(), page_size: 6 });
        setSuggestions(res.items || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Failed to autocomplete image codes:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectCode = (item: ImageCode) => {
    onRowChange(index, "image_code", item.image_code);
    onRowChange(index, "image_code_id", item.id);
    onRowChange(index, "image_code_status", true);
    onRowChange(index, "image_name", item.image_name);
    onRowChange(index, "image_category_name", item.category_name || "");
    onRowChange(index, "image_source", "gallery");
    onRowChange(index, "project_images", [
      { img_url: item.image_url, platform_name: "Cloudinary", status: true },
    ]);

    setSearchQuery(item.image_code);
    setShowDropdown(false);
  };

  const handleClearCode = () => {
    onRowChange(index, "image_code", "");
    onRowChange(index, "image_code_id", 0);
    onRowChange(index, "image_code_status", false);
    onRowChange(index, "image_name", "");
    onRowChange(index, "image_category_name", "");
    onRowChange(index, "image_source", undefined);
    onRowChange(index, "project_images", []);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center gap-2 min-w-[210px] max-w-[260px]">
      {/* 1. Integrated Image Thumbnail / Action Box */}
      <div
        onClick={() => {
          if (isDisabled || isUploading) return;
          if (previewUrl && onPreviewImage) {
            onPreviewImage({
              url: previewUrl,
              code: row.image_code,
              name: row.image_name,
              idx: index,
            });
          } else {
            onOpenGallery(index);
          }
        }}
        className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center relative group transition-all ${
          isDisabled
            ? "bg-slate-50 border-slate-200 opacity-60 pointer-events-none"
            : isUploading
            ? "bg-indigo-50/50 border-indigo-200"
            : previewUrl
            ? "border-slate-200 hover:border-indigo-500 hover:shadow-sm cursor-pointer bg-white"
            : isPendingArtwork
            ? "border-amber-300 bg-amber-50 cursor-pointer"
            : "border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/40 cursor-pointer"
        }`}
        title={
          isUploading
            ? "Uploading image..."
            : previewUrl
            ? "Click to view full image preview"
            : isPendingArtwork
            ? "Artwork pending (click to select image)"
            : isDisabled
            ? "Select product first"
            : "Click to choose artwork from gallery"
        }
      >
        {isUploading ? (
          <RefreshCw size={14} className="text-indigo-600 animate-spin" />
        ) : previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <ZoomIn size={12} className="text-white" />
            </div>
            {rowImages.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] font-bold px-1 rounded-full shadow-xs">
                +{rowImages.length - 1}
              </span>
            )}
          </>
        ) : isPendingArtwork ? (
          <Clock size={16} className="text-amber-500" />
        ) : (
          <ImageIcon size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        )}
      </div>

      {/* 2. Image Code Input & Subtext Details */}
      <div className="relative flex flex-col gap-0.5 flex-1 min-w-0" ref={dropdownRef}>
        <div
          className={`flex items-center border rounded-lg overflow-hidden transition-all bg-white h-[38px] ${
            isDisabled
              ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
              : isLocked
              ? "border-indigo-300 ring-1 ring-indigo-100 bg-indigo-50/20"
              : isCustomerArtwork
              ? "border-indigo-200 bg-indigo-50/20"
              : isPendingArtwork
              ? "border-amber-200 bg-amber-50/20"
              : "border-slate-200 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-100"
          }`}
        >
          {isLocked ? (
            <div className="flex items-center justify-between w-full px-2 min-w-0">
              <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-1.5 py-0.5 rounded truncate">
                #{row.image_code}
              </span>
              <button
                type="button"
                onClick={handleClearCode}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer shrink-0 ml-1"
                title="Clear Image Code"
              >
                <X size={13} />
              </button>
            </div>
          ) : isCustomerArtwork ? (
            <div className="flex items-center justify-between w-full px-2 min-w-0">
              <span className="text-xs font-semibold text-indigo-700 truncate" title="Custom Uploaded Artwork">
                Customer Art
              </span>
              <button
                type="button"
                onClick={handleClearCode}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer shrink-0 ml-1"
                title="Clear Artwork"
              >
                <X size={13} />
              </button>
            </div>
          ) : isPendingArtwork ? (
            <div className="flex items-center justify-between w-full px-2 min-w-0">
              <span className="text-xs font-semibold text-amber-700 truncate">
                Art Pending
              </span>
              <button
                type="button"
                onClick={handleClearCode}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer shrink-0 ml-1"
                title="Clear Pending Artwork"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder={isDisabled ? "Select product first" : "Search code..."}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (suggestions.length > 0 && searchQuery) setShowDropdown(true);
                }}
                disabled={isDisabled}
                className="w-full h-full px-2 text-xs uppercase font-mono tracking-wider bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal min-w-0"
              />

              <button
                type="button"
                onClick={() => onOpenGallery(index)}
                disabled={isDisabled}
                className={`h-full px-2 border-l border-slate-200 flex items-center justify-center transition-colors shrink-0 ${
                  isDisabled
                    ? "text-slate-300 pointer-events-none"
                    : "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 cursor-pointer bg-slate-50/60"
                }`}
                title="Browse Artwork Gallery"
              >
                <Images size={14} />
              </button>
            </>
          )}
        </div>

        {/* Subtext info */}
        {row.image_name ? (
          <span className="text-[10px] text-slate-600 font-medium truncate px-0.5 leading-tight" title={row.image_name}>
            {row.image_name} {row.image_category_name && <span className="text-slate-400">· {row.image_category_name}</span>}
          </span>
        ) : row.image_source === "customer" ? (
          <span className="text-[10px] text-indigo-600 font-medium px-0.5">Uploaded file</span>
        ) : row.image_source === "pending" ? (
          <span className="text-[10px] text-amber-600 font-medium px-0.5">Artwork pending</span>
        ) : null}

        {/* Dropdown Suggestions */}
        {showDropdown && !isDisabled && !isLocked && (
          <div className="absolute top-[42px] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[200] max-h-56 overflow-y-auto p-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100 min-w-[230px]">
            {isSearching ? (
              <div className="py-3 text-center text-xs text-slate-400">Searching codes...</div>
            ) : suggestions.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">No matching image codes</div>
            ) : (
              suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectCode(item)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-indigo-50/60 cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={12} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 rounded">
                        #{item.image_code}
                      </span>
                      {item.category_name && (
                        <span className="text-[9px] text-slate-400 truncate max-w-[70px]">
                          {item.category_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-700 font-semibold truncate group-hover:text-indigo-900 mt-0.5">
                      {item.image_name}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div
              onClick={() => onOpenGallery(index)}
              className="border-t border-slate-100 mt-1 pt-1.5 pb-0.5 px-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center justify-between"
            >
              <span>Browse Full Gallery</span>
              <Images size={12} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
