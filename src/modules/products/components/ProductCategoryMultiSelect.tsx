"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { Category } from "../types/category";

interface ProductCategoryMultiSelectProps {
  categories: Category[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function ProductCategoryMultiSelect({
  categories = [],
  selectedIds = [],
  onChange,
  label = "Product Categories",
  required = false,
  error,
  placeholder = "Select product categories...",
  disabled = false,
}: ProductCategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredCategories = categories.filter((c) =>
    c.category_name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleToggle = (id: number) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    if (selectedIds.length === categories.length) {
      onChange([]);
    } else {
      onChange(categories.map((c) => c.id));
    }
  };

  const handleRemoveOne = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {selectedIds.length > 0 && (
            <span className="text-[10px] text-indigo-600 font-semibold lowercase">
              {selectedIds.length} selected
            </span>
          )}
        </label>
      )}

      {/* Main Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[42px] border rounded-lg px-3 py-1.5 bg-white text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors ${
          error ? "border-red-400 focus:border-red-500" : isOpen ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-hidden">
          {selectedIds.length === 0 ? (
            <span className="text-slate-400 text-xs select-none">{placeholder}</span>
          ) : (
            selectedIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              const name = cat ? cat.category_name : `Cat #${id}`;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md px-2 py-0.5"
                >
                  <span className="truncate max-w-[140px]">{name}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveOne(e, id)}
                      className="hover:text-indigo-900 cursor-pointer p-0.5 rounded"
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              );
            })
          )}
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-indigo-600" : ""}`}
        />
      </div>

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[1050] overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-100">
          {/* Search & Select All Header */}
          <div className="p-2 border-b border-slate-100 flex flex-col gap-2 bg-slate-50/70">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center justify-between px-1 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {selectedIds.length === categories.length ? "Deselect All" : "Select All"}
              </button>
              <span className="text-[11px] text-slate-400">
                {selectedIds.length} of {categories.length} selected
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-50">
            {filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching product categories.
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isChecked = selectedIds.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggle(cat.id)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                      isChecked
                        ? "bg-indigo-50/70 text-indigo-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="capitalize">{cat.category_name}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
