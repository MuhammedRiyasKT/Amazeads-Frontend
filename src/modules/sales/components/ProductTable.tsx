"use client";

import React, { useState } from "react";
import { Plus, Trash2, Image, X } from "lucide-react";
import { ProductRow } from "../types";
import styles from "./CreateOrderComponents.module.css";

const MOCK_PRODUCTS = [
  { name: "Acrylic Frame (12×18)", price: 2500 },
  { name: "Acrylic Name Board", price: 3200 },
  { name: "Acrylic Keychain", price: 150 },
];

interface ProductTableProps {
  rows: ProductRow[];
  onRowChange: (id: string, field: keyof ProductRow, value: any) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  totalUnits: number;
  tableTotal: number;
}

export default function ProductTable({
  rows,
  onRowChange,
  onAddRow,
  onDeleteRow,
  totalUnits,
  tableTotal,
}: ProductTableProps) {
  const [searchRowId, setSearchRowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectProduct = (id: string, product: typeof MOCK_PRODUCTS[0]) => {
    onRowChange(id, "productName", product.name);
    onRowChange(id, "price", product.price);
    onRowChange(id, "imageUrl", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&q=80");
    setSearchRowId(null);
  };

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>PRODUCT</th>
            <th>SECTION</th>
            <th>IMAGE</th>
            <th>QTY</th>
            <th>PRICE</th>
            <th>ADDL AMT</th>
            <th style={{ textAlign: "right" }}>AMOUNT</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td className={styles.relativeCell}>
                <input
                  type="text"
                  placeholder="Search product..."
                  className={styles.tableInput}
                  value={searchRowId === row.id ? searchQuery : row.productName}
                  onChange={(e) => {
                    setSearchRowId(row.id);
                    setSearchQuery(e.target.value);
                    onRowChange(row.id, "productName", e.target.value);
                  }}
                  onFocus={() => {
                    setSearchRowId(row.id);
                    setSearchQuery(row.productName);
                  }}
                />
                {searchRowId === row.id && (
                  <div className={styles.autocomplete}>
                    {MOCK_PRODUCTS.filter((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((product) => (
                      <div
                        key={product.name}
                        className={styles.autoItem}
                        onClick={() => handleSelectProduct(row.id, product)}
                      >
                        {product.name}
                      </div>
                    ))}
                    <div className={styles.autoClose} onClick={() => setSearchRowId(null)}>
                      <X size={12} /> Close
                    </div>
                  </div>
                )}
              </td>
              <td>
                <select
                  className={styles.tableSelect}
                  value={row.section}
                  onChange={(e) => onRowChange(row.id, "section", e.target.value)}
                >
                  <option>ALL SECTIONS</option>
                  <option>DESIGNING</option>
                  <option>PRINTING</option>
                </select>
              </td>
              <td>
                <div className={styles.imagePreview}>
                  {row.imageUrl ? (
                    <img src={row.imageUrl} alt="preview" className={styles.previewImg} />
                  ) : (
                    <Image size={18} />
                  )}
                </div>
              </td>
              <td>
                <input
                  type="number"
                  className={styles.tableInputCenter}
                  value={row.qty}
                  min="1"
                  onChange={(e) => onRowChange(row.id, "qty", parseInt(e.target.value) || 0)}
                />
              </td>
              <td>
                <div className={styles.priceCell}>
                  <span>₹</span>
                  <input
                    type="number"
                    className={styles.tableInputNoBorder}
                    value={row.price}
                    onChange={(e) => onRowChange(row.id, "price", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </td>
              <td>
                <input
                  type="number"
                  className={styles.tableInputCenter}
                  value={row.addlAmt}
                  onChange={(e) => onRowChange(row.id, "addlAmt", parseFloat(e.target.value) || 0)}
                />
              </td>
              <td className={styles.amountText}>
                ₹{(row.qty * row.price + row.addlAmt).toFixed(2)}
              </td>
              <td>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => onDeleteRow(row.id)}
                  disabled={rows.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.tableFooter}>
        <button type="button" className={styles.addBtn} onClick={onAddRow}>
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