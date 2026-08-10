"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, X, ChevronDown, RefreshCw } from "lucide-react";
import styles from "./CreateOrderComponents.module.css";
import { uploadToCloudinary } from "../services/cloudinary.service";

interface ProductTableProps {
  rows: any[];
  onRowChange: (idx: number, field: string, value: any) => void;
  onAddRow: () => void;
  onDeleteRow: (idx: number) => void;
  totalUnits: number;
  tableTotal: number;
  departments: any[];
  autocompleteProducts: any[];
  commitDate?: string;
  completionDate?: string;
}

export default function ProductTable({
  rows,
  onRowChange,
  onAddRow,
  onDeleteRow,
  totalUnits,
  tableTotal,
  departments,
  autocompleteProducts,
  commitDate,
  completionDate
}: ProductTableProps) {
  const [searchRowIdx, setSearchRowIdx] = useState<number | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(null);

  const sectionRef = useRef<HTMLTableCellElement>(null);
  const autocompleteRef = useRef<HTMLTableCellElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);

  const [uploadingRows, setUploadingRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setActiveSectionIdx(null);
      }
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setSearchRowIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ക്ലിക്ക് ചെയ്യുമ്പോൾ കറക്റ്റ് product_id ഒപ്പം മാപ്പ് ചെയ്ത് സേവ് ചെയ്യുന്നു 🌟
  const handleSelectProduct = (idx: number, prod: any) => {
    onRowChange(idx, "project_name", prod.product_name);
    onRowChange(idx, "unit_price", prod.selling_price);
    onRowChange(idx, "product_id", prod.id || prod.product_id || 1); // കറക്റ്റ് പ്രൊഡക്ട് ഐഡി മാപ്പിംഗ് 🌟
    onRowChange(idx, "is_locked", true);
    setSearchRowIdx(null);
  };

  const handleDeptToggle = (idx: number, currentDepts: number[], deptId: number, checked: boolean) => {
    let updated = [...(currentDepts || [])];
    if (checked) {
      updated.push(deptId);
    } else {
      updated = updated.filter(id => id !== deptId);
    }
    onRowChange(idx, "department_ids", updated);
  };

  const handleAllDeptsToggle = (idx: number, checked: boolean) => {
    onRowChange(idx, "department_ids", checked ? departments.map(d => d.id) : []);
  };

  const handleImageUploadTrigger = (idx: number) => {
    setActiveUploadIdx(idx);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && activeUploadIdx !== null) {
      const selectedFiles = Array.from(e.target.files);
      const idx = activeUploadIdx;

      setUploadingRows(prev => ({ ...prev, [idx]: true }));

      try {
        const project_images = await Promise.all(
          selectedFiles.map(async (file) => {
            const cloudinary = await uploadToCloudinary(file);
            return {
              img_url: cloudinary.secure_url,
              platform_name: "Cloudinary",
              status: true,
            };
          })
        );

        onRowChange(idx, "project_images", project_images);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        alert("Image upload failed. Please verify your upload preset name in cloudinary.service.ts");
      } finally {
        setUploadingRows(prev => ({ ...prev, [idx]: false }));
        setActiveUploadIdx(null);
      }
    }
  };

  return (
    <div className={styles.tableCard}>
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFilesChange} 
        className="hidden" 
        accept="image/*"
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th>PRODUCT</th>
            <th style={{ width: "180px" }}>SECTION</th>
            <th style={{ width: "80px", textAlign: "center" }}>IMAGE</th>
            <th style={{ width: "70px", textAlign: "center" }}>QTY</th>
            <th style={{ width: "130px" }}>PRICE</th>
            <th style={{ width: "130px" }}>ADDL AMT</th>
            <th style={{ width: "140px", textAlign: "right" }}>AMOUNT</th>
            <th style={{ width: "50px" }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rowDepts = row.department_ids || [];
            const rowImages = row.project_images || [];
            const previewUrl = rowImages.length > 0 ? rowImages[0].img_url : null;
            const isUploading = !!uploadingRows[index];
            const isLocked = !!row.is_locked;

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                
                {/* Autocomplete Input */}
                <td className={styles.relativeCell} ref={searchRowIdx === index ? autocompleteRef : undefined}>
                  <div className="relative flex items-center w-full">
                    <input
                      type="text"
                      placeholder="Search product..."
                      className={`${styles.tableInput} ${isLocked ? "bg-slate-50 text-slate-400 font-bold border-slate-200/80" : ""}`}
                      value={row.project_name}
                      disabled={isLocked}
                      onChange={(e) => {
                        onRowChange(index, "project_name", e.target.value);
                        setSearchRowIdx(index);
                      }}
                      onFocus={() => setSearchRowIdx(index)}
                    />
                    {isLocked && (
                      <button
                        type="button"
                        onClick={() => {
                          onRowChange(index, "project_name", "");
                          onRowChange(index, "unit_price", 0);
                          onRowChange(index, "is_locked", false);
                        }}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Unlock and clear product"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  {searchRowIdx === index && row.project_name && !isLocked && (
                    <div className="absolute top-11 left-2 right-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[150] max-h-48 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                      {autocompleteProducts
                        .filter(p => p.product_name.toLowerCase().includes(row.project_name.toLowerCase()))
                        .map((prod, pIdx) => (
                          <div
                            key={pIdx}
                            className="px-3 py-2 text-xs hover:bg-slate-50 rounded-md cursor-pointer font-bold text-slate-700 flex justify-between"
                            onClick={() => handleSelectProduct(index, prod)}
                          >
                            {/* ബാക്കെൻഡ് ഐഡി ഒപ്പം പാസ്സ് ചെയ്യുന്നു */}
                            <span>{prod.product_name}</span>
                            <span className="text-indigo-600 font-bold">₹{prod.selling_price}</span>
                          </div>
                        ))}
                      <div className="px-3 py-1.5 text-[10px] text-slate-400 border-t mt-1 text-right cursor-pointer" onClick={() => setSearchRowIdx(null)}>
                        Close suggestions
                      </div>
                    </div>
                  )}
                </td>

                {/* Section selection */}
                <td className="relative" ref={activeSectionIdx === index ? sectionRef : undefined}>
                  <button
                    type="button"
                    onClick={() => setActiveSectionIdx(activeSectionIdx === index ? null : index)}
                    className="w-full h-9 border border-slate-200 rounded px-3 bg-white text-xs font-semibold text-slate-700 flex items-center justify-between hover:border-slate-300 cursor-pointer shadow-sm"
                  >
                    <span>
                      {rowDepts.length === departments.length 
                        ? "ALL SECTIONS" 
                        : rowDepts.length === 0 
                        ? "Choose Section" 
                        : `${rowDepts.length} Selected`}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {activeSectionIdx === index && (
                    <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-[150] p-3 flex flex-col gap-2.5 min-w-[200px]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 pb-1.5 border-b select-none">
                        <input 
                          type="checkbox" 
                          checked={rowDepts.length === departments.length} 
                          onChange={(e) => handleAllDeptsToggle(index, e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>ALL SECTIONS</span>
                      </label>
                      {departments.map((dept) => {
                        const isChecked = rowDepts.includes(dept.id);
                        const isDesigning = dept.department_name.toLowerCase() === "designing";
                        const isPrinting = dept.department_name.toLowerCase() === "printing";

                        return (
                          <div key={dept.id} className="flex flex-col gap-1.5 border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none capitalize">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={(e) => handleDeptToggle(index, rowDepts, dept.id, e.target.checked)} 
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{dept.department_name}</span>
                            </label>

                            {isDesigning && isChecked && (
                              <div className="flex flex-col gap-1 pl-5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Design Deadline</span>
                                <input
                                  type="date"
                                  value={row.design_date || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val && commitDate && completionDate) {
                                      const selected = new Date(val);
                                      const start = new Date(commitDate);
                                      const end = new Date(completionDate);
                                      if (selected < start || selected > end) {
                                        alert(`Design Date must be between Commit Date (${commitDate}) and Completion Date (${completionDate})!`);
                                        onRowChange(index, "design_date", "");
                                        return;
                                      }
                                    }
                                    onRowChange(index, "design_date", val);
                                  }}
                                  className="h-7 border border-slate-200 rounded px-2 text-[10px] focus:outline-none"
                                />
                              </div>
                            )}

                            {isPrinting && isChecked && (
                              <div className="flex flex-col gap-1 pl-5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Print Deadline</span>
                                <input
                                  type="date"
                                  value={row.printing_date || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val && commitDate && completionDate) {
                                      const selected = new Date(val);
                                      const start = new Date(commitDate);
                                      const end = new Date(completionDate);
                                      if (selected < start || selected > end) {
                                        alert(`Printing Date must be between Commit Date (${commitDate}) and Completion Date (${completionDate})!`);
                                        onRowChange(index, "printing_date", "");
                                        return;
                                      }
                                    }
                                    onRowChange(index, "printing_date", val);
                                  }}
                                  className="h-7 border border-slate-200 rounded px-2 text-[10px] focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>

                {/* Image block */}
                <td>
                  <div 
                    onClick={() => !isUploading && handleImageUploadTrigger(index)} 
                    className={`${styles.imagePreview} relative flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all`}
                    title="Click to select multiple images"
                  >
                    {isUploading ? (
                      <RefreshCw size={16} className="text-indigo-600 animate-spin" />
                    ) : previewUrl ? (
                      <>
                        <img src={previewUrl} alt="preview" className={styles.previewImg} />
                        {rowImages.length > 1 && (
                          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            +{rowImages.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <ImageIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                </td>

                <td>
                  <input
                    type="number"
                    className={styles.tableInputCenter}
                    value={row.quantity}
                    min="1"
                    onChange={(e) => onRowChange(index, "quantity", parseInt(e.target.value) || 0)}
                  />
                </td>

                <td>
                  <div className={`${styles.priceCell} ${isLocked ? "bg-slate-50 border-slate-200/80" : ""}`}>
                    <span className="text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      className={`${styles.tableInputNoBorder} ${isLocked ? "text-slate-400 font-bold" : ""}`}
                      value={row.unit_price}
                      disabled={isLocked}
                      onChange={(e) => onRowChange(index, "price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>

                <td>
                  <input
                    type="number"
                    className={styles.tableInputCenter}
                    value={row.additional_amount}
                    onChange={(e) => onRowChange(index, "additional_amount", parseFloat(e.target.value) || 0)}
                  />
                </td>

                <td className={styles.amountText}>
                  ₹{(row.quantity * row.unit_price + row.additional_amount).toFixed(2)}
                </td>

                <td>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => onDeleteRow(index)}
                    disabled={rows.length === 1}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.tableFooter}>
        <button type="button" className={styles.addBtn} onClick={onAddRow} style={{ cursor: "pointer" }}>
          <Plus size={16} /> ADD PRODUCT
        </button>
        <div className={styles.tableSummary}>
          <span>TOTAL UNITS: <strong>{totalUnits}</strong></span>
          <span>TABLE TOTAL: <strong>₹{tableTotal.toLocaleString("en-IN")}.00</strong></span>
        </div>
      </div>
    </div>
  );
}