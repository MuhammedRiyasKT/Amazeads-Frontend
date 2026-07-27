"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, X, ChevronDown } from "lucide-react";
import styles from "./CreateOrderComponents.module.css";

interface ProductTableProps {
  rows: any[];
  onRowChange: (idx: number, field: string, value: any) => void;
  onAddRow: () => void;
  onDeleteRow: (idx: number) => void;
  totalUnits: number;
  tableTotal: number;
  departments: any[];
  autocompleteProducts: any[];
}

export default function ProductTable({
  rows,
  onRowChange,
  onAddRow,
  onDeleteRow,
  totalUnits,
  tableTotal,
  departments,
  autocompleteProducts
}: ProductTableProps) {
  const [searchRowIdx, setSearchRowIdx] = useState<number | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(null);

  const sectionRef = useRef<HTMLTableDataCellElement | null>(null);
  const autocompleteRef = useRef<HTMLTableDataCellElement | null>(null);

  // ഔട്ട്‌സൈഡ് ക്ലിക്ക് ക്ലോസിങ് ലോജിക്
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

  // പ്രൊഡക്ട് സെലക്ട് ചെയ്യുമ്പോൾ ബാക്കെൻഡ് കീകളായ project_name, unit_price എന്നിവയിലേക്ക് മാപ്പ് ചെയ്യുന്നു 🌟
  const handleSelectProduct = (idx: number, prod: any) => {
    onRowChange(idx, "project_name", prod.product_name);
    onRowChange(idx, "unit_price", prod.selling_price);
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

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th>PRODUCT</th>
            <th style={{ width: "180px" }}>SECTION</th>
            <th style={{ width: "60px", textAlign: "center" }}>IMAGE</th>
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
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                
                {/* Autocomplete Input (ഇൻപുട്ട് ബോക്സിന് താഴെ വരുന്ന സഗ്ഗഷൻ ലിസ്റ്റ്) */}
                <td className={styles.relativeCell} ref={searchRowIdx === index ? autocompleteRef : null}>
                  <input
                    type="text"
                    placeholder="Search product..."
                    className={styles.tableInput}
                    value={row.project_name}
                    onChange={(e) => {
                      onRowChange(index, "project_name", e.target.value);
                      setSearchRowIdx(index);
                    }}
                    onFocus={() => setSearchRowIdx(index)}
                  />
                  {searchRowIdx === index && row.project_name && (
                    <div className="absolute top-11 left-2 right-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[150] max-h-48 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                      {autocompleteProducts
                        .filter(p => p.product_name.toLowerCase().includes(row.project_name.toLowerCase()))
                        .map((prod, pIdx) => (
                          <div
                            key={pIdx}
                            className="px-3 py-2 text-xs hover:bg-slate-50 rounded-md cursor-pointer font-bold text-slate-700 flex justify-between"
                            onClick={() => handleSelectProduct(index, prod)}
                          >
                            <span>{prod.product_name}</span>
                            <span className="text-indigo-600">₹{prod.selling_price}</span>
                          </div>
                        ))}
                      <div className="px-3 py-1.5 text-[10px] text-slate-400 border-t mt-1 text-right cursor-pointer" onClick={() => setSearchRowIdx(null)}>
                        Close suggestions
                      </div>
                    </div>
                  )}
                </td>

                {/* Section selection dropdown checklist 🌟 */}
                <td className="relative" ref={activeSectionIdx === index ? sectionRef : null}>
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
                    <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-[150] p-3 flex flex-col gap-2 min-w-[170px]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 pb-1.5 border-b select-none">
                        <input 
                          type="checkbox" 
                          checked={rowDepts.length === departments.length} 
                          onChange={(e) => handleAllDeptsToggle(index, e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>ALL SECTIONS</span>
                      </label>
                      {departments.map((dept) => (
                        <label key={dept.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none capitalize">
                          <input 
                            type="checkbox" 
                            checked={rowDepts.includes(dept.id)} 
                            onChange={(e) => handleDeptToggle(index, rowDepts, dept.id, e.target.checked)} 
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{dept.department_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </td>

                {/* Image placeholder */}
                <td>
                  <div className={styles.imagePreview}>
                    {row.imageUrl ? (
                      <img src={row.imageUrl} alt="preview" className={styles.previewImg} />
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
                  <div className={styles.priceCell}>
                    <span className="text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      className={styles.tableInputNoBorder}
                      value={row.unit_price}
                      onChange={(e) => onRowChange(index, "unit_price", parseFloat(e.target.value) || 0)}
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