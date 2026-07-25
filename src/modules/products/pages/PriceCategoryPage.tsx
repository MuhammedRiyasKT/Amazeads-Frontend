"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { usePriceCategories } from "../hooks/usePriceCategories";
import { createPriceCategory, updatePriceCategory, deletePriceCategory } from "../services/category.service";
import PriceCategoryDialog from "../components/PriceCategoryDialog";
import { PriceCategory } from "../types/category";

export default function PriceCategoryPage() {
  const { priceCategories, isLoading, refetch } = usePriceCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PriceCategory | null>(null);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: PriceCategory) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const handleSave = async (payload: { price_category_name: string; status: boolean }) => {
    try {
      if (selectedItem) {
        await updatePriceCategory(selectedItem.id, payload);
      } else {
        await createPriceCategory(payload);
      }
      setIsOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this price tier?")) return;
    try {
      await deletePriceCategory(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Price Tiers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage target classifications like Wholesaler, reseller, etc.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus size={16} /> New Tier
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "80px" }}>ID</TableHead>
              <TableHead>Tier Name</TableHead>
              <TableHead style={{ width: "120px" }}>Status</TableHead>
              <TableHead style={{ width: "120px", textAlign: "center" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400 font-medium">Loading Tiers...</TableCell></TableRow>
            ) : priceCategories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400 font-medium">No records found.</TableCell></TableRow>
            ) : (
              priceCategories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold text-slate-600">#{item.id}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{item.price_category_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status ? "bg-green-50 text-green-700 border border-green-100" : "bg-slate-100 text-slate-500"}`}>
                      {item.status ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer">
                        <Trash size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PriceCategoryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onSave={handleSave} editData={selectedItem} />
    </div>
  );
}