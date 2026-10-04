"use client";

import React from "react";
import { X, Tag, Calendar, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { ImageCategory } from "../types/imageCode";

interface ImageCategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ImageCategory | null;
}

export default function ImageCategoryViewModal({
  isOpen,
  onClose,
  category,
}: ImageCategoryViewModalProps) {
  if (!isOpen || !category) return null;

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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Tag className="text-indigo-600" size={17} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Category Details
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
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                ID #{category.id}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                  category.is_active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {category.is_active ? (
                  <>
                    <CheckCircle2 size={11} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={11} /> Inactive
                  </>
                )}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 leading-tight">
                {category.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {category.description && category.description !== "nil"
                  ? category.description
                  : "No description provided."}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar size={11} /> Created
              </span>
              <span className="font-semibold text-slate-800">{formatDate(category.created_at)}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar size={11} /> Updated
              </span>
              <span className="font-semibold text-slate-800">{formatDate(category.updated_at)}</span>
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
