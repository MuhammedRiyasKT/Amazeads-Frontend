"use client";

import React, { useState } from "react";
import { CheckSquare } from "lucide-react";
import { ProductRow } from "../types";
import CustomerScheduleForm from "../components/CustomerScheduleForm";
import ProductTable from "../components/ProductTable";
import BillingSummary from "../components/BillingSummary";
import styles from "../components/CreateOrderComponents.module.css";

export default function CreateOrderPage() {
  const [rows, setRows] = useState<ProductRow[]>([
    {
      id: "1",
      productName: "Acrylic Frame (12×18)",
      section: "ALL SECTIONS",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&q=80",
      qty: 1,
      price: 2500,
      addlAmt: 0,
    },
  ]);

  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const tableTotal = rows.reduce((acc, row) => acc + (row.qty * row.price + row.addlAmt), 0);
  const totalUnits = rows.reduce((acc, row) => acc + row.qty, 0);

  const handleRowChange = (id: string, field: keyof ProductRow, value: any) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleAddRow = () => {
    const newId = (rows.length + 1).toString();
    setRows([...rows, { id: newId, productName: "", section: "ALL SECTIONS", imageUrl: "", qty: 1, price: 0, addlAmt: 0 }]);
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <CustomerScheduleForm />
      
      <ProductTable
        rows={rows}
        onRowChange={handleRowChange}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        totalUnits={totalUnits}
        tableTotal={tableTotal}
      />

      <BillingSummary
        tableTotal={tableTotal}
        discount={discount}
        onDiscountChange={setDiscount}
        paidAmount={paidAmount}
        onPaidAmountChange={setPaidAmount}
      />

      <div className={styles.actionButtonsRow}>
        <button type="button" className={styles.discardBtn}>Discard</button>
        <button type="button" className={styles.draftBtn}>SAVE DRAFT</button>
        <button type="button" className={styles.submitBtn}>
          <CheckSquare size={18} /> SUBMIT ORDER
        </button>
      </div>
    </div>
  );
}