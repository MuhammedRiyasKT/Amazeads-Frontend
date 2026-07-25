"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { PriceCategory } from "../types/category";

interface PriceCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { price_category_name: string; status: boolean }) => void;
  editData?: PriceCategory | null;
}

export default function PriceCategoryDialog({ isOpen, onClose, onSave, editData }: PriceCategoryDialogProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (editData) {
      setName(editData.price_category_name);
      setStatus(editData.status);
    } else {
      setName("");
      setStatus(true);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ price_category_name: name.trim(), status });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-slate-800 text-sm uppercase">{editData ? "Edit" : "Create"} Price Tier</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Tier Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
            <select value={status ? "true" : "false"} onChange={(e) => setStatus(e.target.value === "true")} className="h-10 border rounded-lg px-3 text-sm bg-white focus:outline-none">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Save Tier</Button>
          </div>
        </form>
      </div>
    </div>
  );
}