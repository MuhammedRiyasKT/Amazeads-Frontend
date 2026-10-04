"use client";

import React from "react";
import { X, Images, ExternalLink, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";

interface ImageEnlargedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  imageCode?: string;
  imageName?: string;
  onChangeImage?: () => void;
}

export default function ImageEnlargedPreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageCode,
  imageName,
  onChangeImage,
}: ImageEnlargedPreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[1150] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 min-w-0">
            {imageCode ? (
              <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                #{imageCode}
              </span>
            ) : (
              <span className="font-semibold text-xs text-slate-500">Customer Artwork</span>
            )}
            <span className="text-xs font-bold text-slate-800 truncate">
              {imageName || "Artwork Preview"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Preview Box */}
        <div className="relative w-full h-80 bg-slate-950 flex items-center justify-center overflow-hidden group">
          <img
            src={imageUrl}
            alt={imageName || "preview"}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Preview+Error";
            }}
          />

          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-sm border border-slate-200 transition-all opacity-0 group-hover:opacity-100 cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Open in new tab"
          >
            <ExternalLink size={13} /> Open Original
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500">
            {imageCode ? "Catalog Image Code attached" : "Custom uploaded file"}
          </div>

          <div className="flex items-center gap-2">
            {onChangeImage && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  onClose();
                  onChangeImage();
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <Images size={13} /> Change Image
              </Button>
            )}

            <Button variant="primary" size="sm" type="button" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
