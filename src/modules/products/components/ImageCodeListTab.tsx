"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Filter, Eye, Edit2, Trash2, Image as ImageIcon, RotateCcw, Layers, FolderTree, FileSpreadsheet } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { ImageCode, ImageCategory, ImageCodePagination } from "../types/imageCode";
import { Category } from "../types/category";
import { getImageCodes, getImageCategories, deleteImageCode } from "../services/imageCode.service";
import { getCategories } from "../services/category.service";
import { exportImageCodesToExcel } from "../utils/productExport";
import ImageCodeDialog from "./ImageCodeDialog";
import ImageCodeDetailsModal from "./ImageCodeDetailsModal";
import ImageCategoryManagerDrawer from "./ImageCategoryManagerDrawer";

export default function ImageCodeListTab() {
  // Data states
  const [imageCodes, setImageCodes] = useState<ImageCode[]>([]);
  const [pagination, setPagination] = useState<ImageCodePagination>({
    page: 1,
    page_size: 5,
    total_count: 0,
    total_pages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Categories metadata
  const [imageCategories, setImageCategories] = useState<ImageCategory[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ImageCode | null>(null);
  const [detailsItem, setDetailsItem] = useState<ImageCode | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Debounce search query
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  const refreshCategories = useCallback(() => {
    getImageCategories({ is_active: true })
      .then((data) => setImageCategories(data || []))
      .catch((err) => console.error("Failed to load image categories:", err));
  }, []);

  // Initial load of categories
  useEffect(() => {
    refreshCategories();

    getCategories()
      .then((data) => setProductCategories(data || []))
      .catch((err) => console.error("Failed to load product categories:", err));
  }, [refreshCategories]);

  // Fetch Image Codes from backend
  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getImageCodes({
        page: currentPage,
        page_size: 5,
        category_id: selectedCategoryId !== "" ? selectedCategoryId : undefined,
        search: debouncedSearch.trim() || undefined,
      });

      setImageCodes(data.items || []);
      setPagination(
        data.pagination || {
          page: 1,
          page_size: 5,
          total_count: 0,
          total_pages: 1,
        }
      );
    } catch (err) {
      console.error("Failed to fetch image codes:", err);
      setImageCodes([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategoryId, debouncedSearch]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: ImageCode) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleOpenDetails = (item: ImageCode) => {
    setDetailsItem(item);
    setIsDetailsOpen(true);
  };

  const handleDelete = async (item: ImageCode) => {
    if (!window.confirm(`Are you sure you want to delete Image Code "${item.image_code}"?`)) {
      return;
    }
    try {
      await deleteImageCode(item.id);
      // If we deleted the only item on the last page, navigate back
      if (imageCodes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchCodes();
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      const msg = err.response?.data?.message || "Failed to delete image code";
      alert(msg);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategoryId("");
    setCurrentPage(1);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      let codesToExport = imageCodes;

      // If more image codes exist across pages, fetch full dataset matching current filters
      if (pagination.total_count > imageCodes.length) {
        try {
          const allData = await getImageCodes({
            page: 1,
            page_size: pagination.total_count || 1000,
            category_id: selectedCategoryId !== "" ? selectedCategoryId : undefined,
            search: debouncedSearch.trim() || undefined,
          });
          if (allData?.items && allData.items.length > 0) {
            codesToExport = allData.items;
          }
        } catch (fetchErr) {
          console.warn("Could not fetch all image codes, exporting current page instead:", fetchErr);
          codesToExport = imageCodes;
        }
      }

      if (codesToExport.length === 0) {
        alert("No image codes found to export.");
        return;
      }

      exportImageCodesToExcel({
        imageCodes: codesToExport,
        imageCategories,
        productCategories,
      });
    } catch (err) {
      console.error("Export image codes error:", err);
      alert("Failed to export image codes to Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to render linked product categories badge list
  const renderProductCategoryBadges = (item: ImageCode) => {
    let names: string[] = [];

    if (item.product_categories && item.product_categories.length > 0) {
      names = item.product_categories.map((c) => c.category_name || c.name || `Cat #${c.id}`);
    } else if (item.product_category_ids && item.product_category_ids.length > 0) {
      names = item.product_category_ids.map((id) => {
        const found = productCategories.find((pc) => pc.id === id);
        return found ? found.category_name : `#${id}`;
      });
    }

    if (names.length === 0) {
      return <span className="text-slate-400 text-xs italic">—</span>;
    }

    const visible = names.slice(0, 2);
    const extraCount = names.length - 2;

    return (
      <div className="flex flex-wrap items-center gap-1">
        {visible.map((name, i) => (
          <span
            key={i}
            className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5"
          >
            {name}
          </span>
        ))}
        {extraCount > 0 && (
          <span
            className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5"
            title={names.slice(2).join(", ")}
          >
            +{extraCount}
          </span>
        )}
      </div>
    );
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategoryId !== "";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="text-indigo-600" size={24} />
            Image Code Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create, categorize, and link custom image codes to product categories.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer shadow-xs font-semibold"
            title="Convert and download image codes to Excel sheet"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            {isExporting ? "Exporting..." : "Export to Excel"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 cursor-pointer w-fit"
          >
            <Plus size={16} /> Add Image Code
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Instant Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search code, name, description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-600"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

          {/* Category Filter and Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value === "" ? "" : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">All Image Categories</option>
              {imageCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="h-10 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Manage Categories"
          >
            <FolderTree size={14} className="text-indigo-600" />
            Manage Categories
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="h-10 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "70px", textAlign: "center" }}>Preview</TableHead>
                <TableHead style={{ width: "120px" }}>Image Code</TableHead>
                <TableHead style={{ width: "200px" }}>Image Name</TableHead>
                <TableHead style={{ width: "140px" }}>Image Category</TableHead>
                <TableHead style={{ width: "220px" }}>Linked Product Categories</TableHead>
                <TableHead style={{ width: "100px", textAlign: "center" }}>Status</TableHead>
                <TableHead style={{ width: "120px" }}>Created Date</TableHead>
                <TableHead style={{ width: "110px", textAlign: "center" }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Loading image codes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : imageCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ImageIcon size={20} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No Image Codes Found</p>
                      <p className="text-xs text-slate-400 text-center">
                        {hasActiveFilters
                          ? "Try adjusting your search criteria or clearing filters."
                          : "Get started by adding your first image code to the repository."}
                      </p>
                      {hasActiveFilters ? (
                        <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                          Clear Filters
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="mt-2">
                          <Plus size={14} className="mr-1" /> Add Image Code
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                imageCodes.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Image Preview Thumbnail */}
                    <TableCell style={{ textAlign: "center" }}>
                      <div
                        onClick={() => handleOpenDetails(item)}
                        className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mx-auto flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
                        title="Click to view details"
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.image_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/40x40?text=Err";
                            }}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-slate-400" />
                        )}
                      </div>
                    </TableCell>

                    {/* Image Code */}
                    <TableCell>
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200/80 px-2 py-0.5 rounded">
                        #{item.image_code}
                      </span>
                    </TableCell>

                    {/* Image Name & Description */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{item.image_name}</span>
                        {item.description && item.description !== "nil" && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[190px]">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Image Category */}
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">
                        {item.category_name || `Category #${item.category_id}`}
                      </span>
                    </TableCell>

                    {/* Linked Product Categories */}
                    <TableCell>{renderProductCategoryBadges(item)}</TableCell>

                    {/* Status */}
                    <TableCell style={{ textAlign: "center" }}>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell>
                      <span className="text-xs text-slate-500 font-medium">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(item)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors border border-indigo-100/40"
                          title="View Specifications"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200/50"
                          title="Edit Image Code"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition-colors border border-red-100/50"
                          title="Delete Image Code"
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

        {/* Pagination Row */}
        {pagination.total_pages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-t border-slate-100 px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">
              Showing page {pagination.page} of {pagination.total_pages} ({pagination.total_count} total items)
            </div>
            <Pagination
              total={pagination.total_count}
              limit={pagination.page_size}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <ImageCodeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchCodes}
        editData={editingItem}
        imageCategories={imageCategories}
        productCategories={productCategories}
      />

      {/* Specifications Details Modal */}
      <ImageCodeDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        imageCode={detailsItem}
        productCategories={productCategories}
      />

      {/* Category Manager Drawer */}
      <ImageCategoryManagerDrawer
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoriesChanged={() => {
          refreshCategories();
          fetchCodes();
        }}
      />
    </div>
  );
}
