"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ImageCode, ImageCategory, CreateImageCodePayload } from "../types/imageCode";
import { Category } from "../types/category";
import { validateImageCode, createImageCode, updateImageCode } from "../services/imageCode.service";
import { uploadToCloudinary } from "@/modules/sales/services/cloudinary.service";
import ProductCategoryMultiSelect from "./ProductCategoryMultiSelect";

interface ImageCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ImageCode | null;
  imageCategories: ImageCategory[];
  productCategories: Category[];
}

export default function ImageCodeDialog({
  isOpen,
  onClose,
  onSuccess,
  editData,
  imageCategories,
  productCategories,
}: ImageCodeDialogProps) {
  // Form fields
  const [imageCode, setImageCode] = useState("");
  const [imageName, setImageName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [productCategoryIds, setProductCategoryIds] = useState<number[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Uniqueness validation states
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<"idle" | "available" | "taken" | "invalid">("idle");
  const [codeMessage, setCodeMessage] = useState("");
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize/reset form
  useEffect(() => {
    if (editData) {
      setImageCode(editData.image_code || "");
      setImageName(editData.image_name || "");
      setDescription(editData.description || "");
      setCategoryId(editData.category_id || "");
      setImageUrl(editData.image_url || "");
      setIsActive(editData.is_active ?? true);

      // Pre-select existing product category IDs
      if (editData.product_category_ids && Array.isArray(editData.product_category_ids)) {
        setProductCategoryIds(editData.product_category_ids);
      } else if (editData.product_categories && Array.isArray(editData.product_categories)) {
        setProductCategoryIds(editData.product_categories.map((c) => c.id));
      } else {
        setProductCategoryIds([]);
      }

      setCodeStatus("available");
      setCodeMessage("");
    } else {
      setImageCode("");
      setImageName("");
      setDescription("");
      setCategoryId(imageCategories.length > 0 ? imageCategories[0].id : "");
      setProductCategoryIds([]);
      setImageUrl("");
      setIsActive(true);
      setCodeStatus("idle");
      setCodeMessage("");
    }
    setFormError(null);
    setUploadError(null);
  }, [editData, isOpen, imageCategories]);

  // Code uniqueness validation
  const checkCodeAvailability = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setCodeStatus("idle");
      setCodeMessage("");
      return;
    }

    // If editing and code is unchanged, no need to check
    if (editData && editData.image_code.toLowerCase() === trimmed.toLowerCase()) {
      setCodeStatus("available");
      setCodeMessage("");
      return;
    }

    setIsValidatingCode(true);
    try {
      const res = await validateImageCode(trimmed);
      if (res && res.is_available) {
        setCodeStatus("available");
        setCodeMessage("Image code is available");
      } else {
        setCodeStatus("taken");
        setCodeMessage("Image code already exists, choose another");
      }
    } catch (err: any) {
      console.error("Code validation error:", err);
      // Fallback if API returned 400 or error status
      setCodeStatus("invalid");
      setCodeMessage("Could not verify code availability");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleImageCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setImageCode(val);
    setCodeStatus("idle");
    setCodeMessage("");

    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    if (val.trim().length >= 2) {
      validationTimerRef.current = setTimeout(() => {
        checkCodeAvailability(val);
      }, 500);
    }
  };

  const handleImageCodeBlur = () => {
    if (codeStatus === "idle" && imageCode.trim().length >= 2) {
      checkCodeAvailability(imageCode);
    }
  };

  // Cloudinary File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must not exceed 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const data = await uploadToCloudinary(file);
      if (data && (data.secure_url || data.url)) {
        setImageUrl(data.secure_url || data.url);
      } else {
        throw new Error("No image URL returned from Cloudinary");
      }
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setUploadError("Image upload failed. Please try again or paste image URL.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedCode = imageCode.trim();
    const trimmedName = imageName.trim();

    if (!trimmedCode) {
      setFormError("Image Code is required.");
      return;
    }
    if (codeStatus === "taken") {
      setFormError("The specified Image Code is already in use.");
      return;
    }
    if (!trimmedName) {
      setFormError("Image Name is required.");
      return;
    }
    if (categoryId === "") {
      setFormError("Please select an Image Category.");
      return;
    }
    if (productCategoryIds.length === 0) {
      setFormError("Please select at least one Product Category.");
      return;
    }
    if (!imageUrl.trim()) {
      setFormError("Please upload an image or provide an Image URL.");
      return;
    }

    const payload: CreateImageCodePayload = {
      image_code: trimmedCode,
      image_name: trimmedName,
      description: description.trim() || "nil",
      category_id: Number(categoryId),
      image_url: imageUrl.trim(),
      is_active: isActive,
      product_category_ids: productCategoryIds,
    };

    setIsSubmitting(true);
    try {
      if (editData) {
        await updateImageCode(editData.id, payload);
      } else {
        await createImageCode(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save image code:", err);
      const apiMsg = err.response?.data?.message || err.message || "Failed to save image code";
      setFormError(apiMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              {editData ? "Edit Image Code" : "Add New Image Code"}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Row 1: Image Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Image Code *</span>
                {isValidatingCode && (
                  <span className="flex items-center gap-1 text-[10px] text-indigo-600 normal-case font-medium">
                    <Loader2 size={10} className="animate-spin" /> Checking...
                  </span>
                )}
                {!isValidatingCode && codeStatus === "available" && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 normal-case font-semibold">
                    <CheckCircle2 size={11} /> Available
                  </span>
                )}
                {!isValidatingCode && codeStatus === "taken" && (
                  <span className="flex items-center gap-1 text-[10px] text-red-600 normal-case font-semibold">
                    <AlertCircle size={11} /> Taken
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. ABC123"
                value={imageCode}
                onChange={handleImageCodeChange}
                onBlur={handleImageCodeBlur}
                required
                className={`h-10 border rounded-lg px-3 text-sm uppercase font-mono tracking-wider focus:outline-none transition-colors ${
                  codeStatus === "taken"
                    ? "border-red-400 focus:border-red-500 bg-red-50/20"
                    : codeStatus === "available"
                    ? "border-emerald-400 focus:border-emerald-500"
                    : "border-slate-200 focus:border-indigo-600"
                }`}
              />
              {codeMessage && (
                <p
                  className={`text-[11px] font-medium ${
                    codeStatus === "taken" ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {codeMessage}
                </p>
              )}
            </div>

            {/* Image Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Image Name *</label>
              <input
                type="text"
                placeholder="e.g. Acrylic Frame Image"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                required
                className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Row 2: Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Image Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                required
                className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="">Select Image Category</option>
                {imageCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
          </div>

          {/* Row 3: Product Categories Multi-Select (Crucial Requirement) */}
          <ProductCategoryMultiSelect
            categories={productCategories}
            selectedIds={productCategoryIds}
            onChange={setProductCategoryIds}
            label="Product Categories (Multi-Select)"
            required
            placeholder="Select one or more product categories..."
          />

          {/* Row 4: Image Upload & Preview */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Image File *</label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/100x100?text=Preview+Error";
                    }}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">{imageName || "Uploaded Image"}</span>
                  <span className="text-[11px] text-slate-400 truncate">{imageUrl}</span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isUploading
                    ? "bg-slate-50 border-indigo-300 pointer-events-none"
                    : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="text-indigo-600 animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">
                      Uploading to Cloudinary...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Click to upload image <span className="font-normal text-slate-500">or drag and drop</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {uploadError && <p className="text-xs text-red-500 font-medium">{uploadError}</p>}
          </div>

          {/* Row 5: Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Provide any additional notes or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Saving...
                </>
              ) : editData ? (
                "Update Image Code"
              ) : (
                "Save Image Code"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
