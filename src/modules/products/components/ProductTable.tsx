"use client";

import React from "react";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Product } from "../types/product";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

export default function ProductTable({ products, isLoading, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "100px" }}>Item Code</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead style={{ width: "100px" }}>Size</TableHead>
            <TableHead style={{ width: "100px" }}>Area</TableHead>
            <TableHead style={{ width: "140px" }}>Base Price</TableHead>
            <TableHead style={{ width: "120px" }}>Status</TableHead>
            <TableHead style={{ width: "110px", textAlign: "center" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-400">Loading products...</TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-400">No records found.</TableCell>
            </TableRow>
          ) : (
            products.map((p) => {
              // ഒന്നാമത്തെ പ്രൈസ് കാറ്റഗറി വിവരങ്ങൾ എടുക്കുന്നു 🌟
              const primaryPrice = p.prices && p.prices.length > 0 ? p.prices[0] : null;

              // ഫസ്റ്റ് കാറ്റഗറി വില അടിസ്ഥാനമാക്കി ബേസ് പ്രൈസ് കണക്കാക്കുന്നു 🌟
              const calculatedBasePrice = primaryPrice
                ? Math.round(
                    (primaryPrice.material_price +
                      primaryPrice.printing_price +
                      primaryPrice.ads_price +
                      primaryPrice.cutting_price +
                      primaryPrice.packing +
                      primaryPrice.other) *
                      primaryPrice.sqft
                  )
                : 0;

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-slate-600">{p.item_code}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{p.product_name}</TableCell>
                  <TableCell>{p.product_size}</TableCell>
                  
                  {/* ടൈപ്പ്സ്ക്രിപ്റ്റ് എറർ പൂർണ്ണമായി പരിഹരിച്ച ഭാഗം 🌟 */}
                  <TableCell>
                    {primaryPrice ? `${primaryPrice.sqft} SqFt` : "—"}
                  </TableCell>
                  
                  <TableCell className="font-bold text-indigo-600">
                    {primaryPrice ? `₹${calculatedBasePrice}` : "—"}
                  </TableCell>

                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status ? "bg-green-50 text-green-700 border border-green-100" : "bg-slate-100 text-slate-600"}`}>
                      {p.status ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1.5">
                      <Link href={`/admin/products/edit/${p.id}`} passHref legacyBehavior>
                        <button className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                          <Edit size={13} />
                        </button>
                      </Link>
                      <button onClick={() => onDelete(p.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer">
                        <Trash size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}