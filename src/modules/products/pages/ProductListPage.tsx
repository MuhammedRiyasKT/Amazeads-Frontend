"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash, Eye, X, Calculator, Tags, Layers, Search, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { Product, ProductPagination } from "../types/product";
import { Category, PriceCategory } from "../types/category"; // ശരിയാക്കിയ ഇമ്പോർട്ടുകൾ
import { getProducts, deleteProduct, getProductById } from "../services/product.service";
import { getCategories, getPriceCategories } from "../services/category.service";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>({
    page: 1,
    page_size: 5,
    total_count: 0,
    total_pages: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // റിലേഷൻ മാപ്പിംഗിനുള്ള ഡാറ്റാസ്
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);

  // ഫിൽട്ടർ & സെർച്ച് സ്റ്റേറ്റുകൾ
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  // മോഡൽ സ്റ്റേറ്റുകൾ
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // പ്രാഥമിക ഡാറ്റ ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    getCategories().then((data) => setCategories(data || [])).catch((err) => console.error(err));
    getPriceCategories().then((data) => setPriceCategories(data || [])).catch((err) => console.error(err));
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const categoryFilter = selectedCategoryId !== "" ? selectedCategoryId : undefined;
      const data = await getProducts(currentPage, 5, categoryFilter);
      setProducts(data.items || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error loading products list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategoryId]);

  // ID വെച്ച് കാറ്റഗറി പേര് കണ്ടുപിടിക്കുന്നു
  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.category_name : `Category #${catId}`;
  };

  // ID വെച്ച് പ്രൈസ് കാറ്റഗറി പേര് കണ്ടുപിടിക്കുന്നു
  const getPriceCategoryName = (priceCatId: number) => {
    const pc = priceCategories.find((c) => c.id === priceCatId);
    return pc ? pc.price_category_name : `Tier #${priceCatId}`;
  };

  // വ്യൂ ഡീറ്റെയിൽസ് കോൾ
  const handleViewDetails = async (id: number) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const data = await getProductById(id);
      setSelectedProduct(data);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
      alert("Error loading product details");
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ഇൻസ്റ്റന്റ് സെർച്ച് ബാർ ലോജിക് (Product Name, Item Code ഫിൽട്ടറിംഗ്)
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(query) ||
      product.item_code.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review, organize and configure targeted pricing structures.</p>
        </div>
        <Link href="/admin/products/create" passHref legacyBehavior>
          <Button variant="primary" size="sm" className="flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Add Product
          </Button>
        </Link>
      </div>

      {/* ഫിൽട്ടർ പാനൽ (സെർച്ച് ബാറും കാറ്റഗറി ഡ്രോപ്പ്ഡൗണും) */}
      <div className="bg-white border border-slate-200/50 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* ഇൻസ്റ്റന്റ് സെർച്ച് ബാർ */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* കാറ്റഗറി ഫിൽട്ടർ ഡ്രോപ്പ്ഡൗൺ */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value === "" ? "" : parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "150px" }}>Product Name</TableHead>
                <TableHead style={{ width: "100px" }}>Item Code</TableHead>
                <TableHead style={{ width: "140px" }}>Product Category</TableHead>
                <TableHead style={{ width: "100px" }}>Size</TableHead>
                <TableHead style={{ width: "100px" }}>SqFt Area</TableHead>
                <TableHead style={{ width: "200px" }}>Price Category Name</TableHead>
                <TableHead style={{ width: "130px", textAlign: "center" }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No products found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-800">{product.product_name}</TableCell>
                      <TableCell className="font-bold text-slate-600">{product.item_code}</TableCell>
                      <TableCell className="capitalize font-semibold text-slate-600">{getCategoryName(product.category_id)}</TableCell>
                      <TableCell>{product.product_size}</TableCell>
                      <TableCell>{product.product_size} SqFt</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {product.prices?.map((price) => (
                            <span key={price.id} className="text-[10px] font-bold text-slate-500 bg-slate-50 border px-2.5 py-0.5 rounded-md w-fit capitalize border-slate-200">
                              {getPriceCategoryName(price.price_category_id)}: ₹{price.selling_price}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1.5">
                          {/* View details Button */}
                          <button
                            onClick={() => handleViewDetails(product.id)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors border border-indigo-100/30"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          
                          <Link href={`/admin/products/edit/${product.id}`} passHref legacyBehavior>
                            <button className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200/50">
                              <Edit size={14} />
                            </button>
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition-colors border border-red-100/50"
                          >
                            <Trash size={14} />
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

        {/* Pagination Row */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-between items-center bg-white border-t border-slate-100 px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">
              Showing page {pagination.page} of {pagination.total_pages}
            </div>
            <Pagination
              total={pagination.total_count}
              limit={pagination.page_size}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* ==========================================
          PRODUCT DETAIL MODAL (കൂടുതൽ വിവരങ്ങൾ കാണിക്കാൻ)
          ========================================== */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-600" size={18} />
                <h3 className="font-bold text-slate-800 text-sm uppercase">Full Product Specifications</h3>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {isDetailLoading || !selectedProduct ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                Fetching full specifications...
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                
                {/* General Info */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="text-base font-bold text-slate-800 leading-tight">{selectedProduct.product_name}</h4>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-600 font-medium mt-1">
                    <span>Item Code: <strong className="text-slate-800 font-bold">{selectedProduct.item_code}</strong></span>
                    <span>Category: <strong className="text-slate-800 font-bold capitalize">{getCategoryName(selectedProduct.category_id)}</strong></span>
                    <span>Product Size: <strong className="text-slate-800 font-bold">{selectedProduct.product_size}</strong></span>
                    <span>Status: <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${selectedProduct.status ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{selectedProduct.status ? "Active" : "Inactive"}</span></span>
                  </div>
                </div>

                {/* Cost Breakdown per Segment (പഴയ കമ്പൈലേഷൻ ബഗ്ഗ് പരിഹരിച്ചത്) */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Calculator size={14} />
                    <span>Calculated Cost Breakdown (Per Segment)</span>
                  </div>
                  {selectedProduct.prices?.map((price) => (
                    <div key={price.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {getPriceCategoryName(price.price_category_id)} Costing Details
                      </span>
                      <div className="grid grid-cols-2 gap-3 mt-1 text-xs font-semibold text-slate-600">
                        <div className="flex justify-between border-b pb-1.5"><span>Material Price / SqFt:</span> <span className="text-slate-800">₹{price.material_price}</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Printing Price / SqFt:</span> <span className="text-slate-800">₹{price.printing_price}</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Spacer charges:</span> <span className="text-slate-800">₹{price.ads_price}</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Cutting Price:</span> <span className="text-slate-800">₹{price.cutting_price}</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Packing Cost:</span> <span className="text-slate-800">₹{price.packing}</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Other overhead:</span> <span className="text-slate-800">₹{price.other}</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Labour Charge:</span> <span className="text-slate-800">{price.labour_charge}%</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Profit margin:</span> <span className="text-emerald-600">{price.profit}%</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>GST Share:</span> <span className="text-indigo-600">{price.gst}%</span></div>
                        <div className="flex justify-between border-b pb-1.5"><span>Total Area:</span> <span className="text-slate-800">{price.sqft} SqFt</span></div>
                      </div>
                      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 mt-2 font-bold text-xs text-indigo-700">
                        <span>Final Target Selling Price:</span>
                        <span className="text-sm">₹{price.selling_price}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedProduct.prices || selectedProduct.prices.length === 0) && (
                    <div className="text-center text-xs text-slate-400 py-2">No category price targets assigned to this product.</div>
                  )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                    Close Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}