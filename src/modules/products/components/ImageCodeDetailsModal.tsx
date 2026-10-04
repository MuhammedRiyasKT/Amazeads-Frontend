"use client";

import React, { useState } from "react";
import { X, ExternalLink, Copy, Check, Calendar, Layers, Tag, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { ImageCode } from "../types/imageCode";
import { Category } from "../types/category";

interface ImageCodeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageCode: ImageCode | null;
  productCategories: Category[];
}

export default function ImageCodeDetailsModal({
  isOpen,
  onClose,
  imageCode,
  productCategories,
}: ImageCodeDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageCode) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(imageCode.image_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to resolve product category names
  const getProductCategoryNames = (): string[] => {
    if (imageCode.product_categories && imageCode.product_categories.length > 0) {
      return imageCode.product_categories.map((c) => c.category_name || c.name || `Cat #${c.id}`);
    }
    if (imageCode.product_category_ids && imageCode.product_category_ids.length > 0) {
      return imageCode.product_category_ids.map((id) => {
        const found = productCategories.find((pc) => pc.id === id);
        return found ? found.category_name : `Product Category #${id}`;
      });
    }
    return [];
  };

  const productCatNames = getProductCategoryNames();

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Image Code Specifications
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Image Preview Box */}
          <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group">
            {imageCode.image_url ? (
              <img
                src={imageCode.image_url}
                alt={imageCode.image_name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/400x300?text=Image+Load+Error";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <ImageIcon size={32} />
                <span className="text-xs">No image preview available</span>
              </div>
            )}

            {imageCode.image_url && (
              <a
                href={imageCode.image_url}
                target="_blank"
                rel="noreferrer"
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-sm border border-slate-200 transition-all opacity-0 group-hover:opacity-100 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Open original image"
              >
                <ExternalLink size={13} /> Open
              </a>
            )}
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {imageCode.image_name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {imageCode.description && imageCode.description !== "nil"
                    ? imageCode.description
                    : "No description provided."}
                </p>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold border shrink-0 ${
                  imageCode.is_active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {imageCode.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Image Code</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    #{imageCode.image_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Image Category</span>
                <span className="font-bold text-slate-800">
                  {imageCode.category_name || `Category #${imageCode.category_id}`}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Created At</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" /> {formatDate(imageCode.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Product Categories */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={12} className="text-indigo-600" /> Linked Product Categories ({productCatNames.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {productCatNames.length > 0 ? (
                productCatNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 rounded-md px-2.5 py-1"
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No product categories linked.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
