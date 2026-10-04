"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, Loader2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { ImageCategory } from "../types/imageCode";
import { createImageCategory, updateImageCategory } from "../services/imageCode.service";

interface ImageCategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ImageCategory | null;
}

export default function ImageCategoryFormDialog({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: ImageCategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
      setIsActive(editData.is_active ?? true);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
    }
    setError(null);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editData) {
        await updateImageCategory(editData.id, {
          name: trimmedName,
          description: description.trim() || "nil",
          is_active: isActive,
        });
      } else {
        await createImageCategory({
          name: trimmedName,
          description: description.trim() || "nil",
          is_active: isActive,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save image category:", err);
      const apiMsg = err.response?.data?.message || err.message || "Failed to save category";
      setError(apiMsg);
    } finally {
      setIsSubmitting(false);
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
              {editData ? "Edit Image Category" : "New Image Category"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. LA78476 or Vintage Wall Frames"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-indigo-600"
              autoFocus
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
            <select
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Brief details about this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin mr-1.5" />
                  Saving...
                </>
              ) : editData ? (
                "Update Category"
              ) : (
                "Save Category"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
