"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { useCategories } from "../hooks/useCategories";
import { createCategory, updateCategory, deleteCategory } from "../services/category.service";
import CategoryDialog from "../components/CategoryDialog";
import { Category } from "../types/category";

export default function ProductCategoryPage() {
  const { categories, isLoading, refetch } = useCategories();
  const [isDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsCategoryDialogOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedItem(cat);
    setIsCategoryDialogOpen(true);
  };

  const handleSave = async (payload: { category_name: string; status: boolean }) => {
    try {
      if (selectedItem) {
        await updateCategory(selectedItem.id, payload);
      } else {
        await createCategory(payload);
      }
      setIsCategoryDialogOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Manage high level catalogs and groupings.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus size={16} /> New Category
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "80px" }}>ID</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead style={{ width: "120px" }}>Status</TableHead>
              <TableHead style={{ width: "120px", textAlign: "center" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400">Loading Categories...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400">No records found.</TableCell></TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-bold text-slate-600">#{cat.id}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{cat.category_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.status ? "bg-green-50 text-green-700 border border-green-100" : "bg-slate-100 text-slate-500"}`}>
                      {cat.status ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => handleOpenEdit(cat)} className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer">
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

      <CategoryDialog isOpen={isDialogOpen} onClose={() => setIsCategoryDialogOpen(false)} onSave={handleSave} editData={selectedItem} />
    </div>
  );
}