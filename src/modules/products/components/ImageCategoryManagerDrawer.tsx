"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Search, Eye, Edit2, Trash2, Tag, Loader2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { ImageCategory } from "../types/imageCode";
import { getImageCategories, deleteImageCategory, updateImageCategory } from "../services/imageCode.service";
import ImageCategoryFormDialog from "./ImageCategoryFormDialog";
import ImageCategoryViewModal from "./ImageCategoryViewModal";

interface ImageCategoryManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged?: () => void;
}

export default function ImageCategoryManagerDrawer({
  isOpen,
  onClose,
  onCategoriesChanged,
}: ImageCategoryManagerDrawerProps) {
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Sub-dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ImageCategory | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<ImageCategory | null>(null);

  const fetchAllCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getImageCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAllCategories();
    }
  }, [isOpen, fetchAllCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: ImageCategory) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleOpenView = (cat: ImageCategory) => {
    setViewingCategory(cat);
    setIsViewOpen(true);
  };

  const handleDelete = async (cat: ImageCategory) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    try {
      await deleteImageCategory(cat.id);
      await fetchAllCategories();
      onCategoriesChanged?.();
    } catch (err: any) {
      console.error("Delete category failed:", err);
      // Fallback: If delete is not supported by backend, offer deactivation
      const confirmDeactivate = window.confirm(
        `Direct delete failed (${err.response?.data?.message || "category may be linked to image codes"}). Would you like to deactivate this category instead?`
      );
      if (confirmDeactivate) {
        try {
          await updateImageCategory(cat.id, {
            name: cat.name,
            description: cat.description || "nil",
            is_active: false,
          });
          await fetchAllCategories();
          onCategoriesChanged?.();
        } catch (deactErr) {
          console.error("Deactivation failed:", deactErr);
          alert("Failed to deactivate category.");
        }
      }
    }
  };

  const handleToggleStatus = async (cat: ImageCategory) => {
    try {
      await updateImageCategory(cat.id, {
        name: cat.name,
        description: cat.description || "nil",
        is_active: !cat.is_active,
      });
      await fetchAllCategories();
      onCategoriesChanged?.();
    } catch (err) {
      console.error("Status toggle failed:", err);
      alert("Failed to update category status");
    }
  };

  const handleFormSuccess = () => {
    fetchAllCategories();
    onCategoriesChanged?.();
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[1050] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Tag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Image Categories
                </h3>
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  {categories.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Organize and manage categories for digital image codes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus size={14} /> New Category
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search category name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={fetchAllCategories}
            className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="border border-slate-200/70 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "60px" }}>ID</TableHead>
                  <TableHead style={{ width: "160px" }}>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead style={{ width: "110px", textAlign: "center" }}>Status</TableHead>
                  <TableHead style={{ width: "120px" }}>Created Date</TableHead>
                  <TableHead style={{ width: "110px", textAlign: "center" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin text-indigo-600" />
                        <span className="text-xs">Loading categories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Tag size={20} className="text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">No categories found</p>
                        <p className="text-[11px] text-slate-400">
                          {search ? "Try searching for a different keyword." : "Click '+ New Category' to create one."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-slate-500">
                        #{cat.id}
                      </TableCell>

                      <TableCell className="font-bold text-slate-800 text-xs">
                        {cat.name}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                        {cat.description && cat.description !== "nil" ? cat.description : "—"}
                      </TableCell>

                      <TableCell style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                            cat.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                          title="Click to toggle status"
                        >
                          {cat.is_active ? "Active" : "Inactive"}
                        </button>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500 font-medium">
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(cat)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors border border-indigo-100/40"
                            title="View Category"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200/50"
                            title="Edit Category"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition-colors border border-red-100/50"
                            title="Delete Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Sub-Dialog: Add / Edit Category */}
      <ImageCategoryFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editData={editingCategory}
      />

      {/* Sub-Dialog: View Category */}
      <ImageCategoryViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        category={viewingCategory}
      />
    </div>
  );
}
