import * as XLSX from "xlsx";
import { Product } from "../types/product";
import { Category, PriceCategory } from "../types/category";
import { ImageCode, ImageCategory } from "../types/imageCode";

export interface ExportProductsOptions {
  products: Product[];
  categories: Category[];
  priceCategories: PriceCategory[];
  filename?: string;
}

export interface ExportImageCodesOptions {
  imageCodes: ImageCode[];
  imageCategories: ImageCategory[];
  productCategories: Category[];
  filename?: string;
}

/**
 * Calculates responsive column widths based on maximum string lengths
 */
function calculateColumnWidths(data: Record<string, any>[]): { wch: number }[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (const row of data) {
      const val = row[key];
      const strVal = val !== null && val !== undefined ? String(val) : "";
      if (strVal.length > maxLen) {
        maxLen = strVal.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

/**
 * Formats a date string into readable YYYY-MM-DD format
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export Products list to formatted Excel (.xlsx) file
 */
export function exportProductsToExcel({
  products,
  categories,
  priceCategories,
  filename,
}: ExportProductsOptions) {
  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.category_name : `Category #${catId}`;
  };

  const getPriceCategoryName = (priceCatId: number) => {
    const pc = priceCategories.find((c) => c.id === priceCatId);
    return pc ? pc.price_category_name : `Tier #${priceCatId}`;
  };

  const rows = products.map((product, index) => {
    // Collect all price tiers into readable summary
    const priceSummaries = (product.prices || []).map((p) => {
      const name = p.price_category_name || getPriceCategoryName(p.price_category_id);
      return `${name}: ₹${p.selling_price}`;
    });

    const rowObj: Record<string, any> = {
      "Sl No": index + 1,
      "Item Code": product.item_code,
      "Product Name": product.product_name,
      Category: getCategoryName(product.category_id),
      Size: product.product_size || "-",
      Status: product.status ? "Active" : "Inactive",
    };

    // Add individual columns for price categories
    priceCategories.forEach((pc) => {
      const foundPrice = product.prices?.find((p) => p.price_category_id === pc.id);
      rowObj[`Price (${pc.price_category_name})`] = foundPrice
        ? `₹${foundPrice.selling_price}`
        : "-";
    });

    rowObj["All Price Tiers"] = priceSummaries.join(", ") || "-";
    rowObj["Created On"] = formatDate(product.created_on);

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = calculateColumnWidths(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const today = new Date().toISOString().split("T")[0];
  const finalFilename = filename || `Products_List_${today}.xlsx`;

  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Export Image Codes list to formatted Excel (.xlsx) file
 */
export function exportImageCodesToExcel({
  imageCodes,
  imageCategories,
  productCategories,
  filename,
}: ExportImageCodesOptions) {
  const rows = imageCodes.map((item, index) => {
    // Resolve Image Category Name
    let categoryName = item.category_name;
    if (!categoryName) {
      const foundCat = imageCategories.find((c) => c.id === item.category_id);
      categoryName = foundCat ? foundCat.name : `Category #${item.category_id}`;
    }

    // Resolve Linked Product Categories
    let linkedProductsStr = "-";
    if (item.product_categories && item.product_categories.length > 0) {
      linkedProductsStr = item.product_categories
        .map((c) => c.category_name || c.name || `Cat #${c.id}`)
        .join(", ");
    } else if (item.product_category_ids && item.product_category_ids.length > 0) {
      linkedProductsStr = item.product_category_ids
        .map((id) => {
          const found = productCategories.find((pc) => pc.id === id);
          return found ? found.category_name : `#${id}`;
        })
        .join(", ");
    }

    return {
      "Sl No": index + 1,
      "Image Code": item.image_code,
      "Image Name": item.image_name,
      "Image Category": categoryName,
      "Linked Product Categories": linkedProductsStr,
      "Image URL": item.image_url || "-",
      Description: item.description || "-",
      Status: item.is_active ? "Active" : "Inactive",
      "Created At": formatDate(item.created_at),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = calculateColumnWidths(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Image Codes");

  const today = new Date().toISOString().split("T")[0];
  const finalFilename = filename || `Image_Codes_List_${today}.xlsx`;

  XLSX.writeFile(workbook, finalFilename);
}
