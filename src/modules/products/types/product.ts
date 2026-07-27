export interface PriceAssignmentPayload {
  id?: number;
  price_category_id: number;
  material_price: number;
  printing_price: number;
  ads_price: number; // Spacer
  profit: number; // Profit %
  cutting_price: number;
  packing: number; // Packing / Courier
  labour_charge: number; // Labour %
  other: number; // Other Adv %
  gst: number; // GST %
  sqft: number; // Total Area
  selling_price: number; // Final Rounded/Edited Price
  status: boolean;
}

export interface ProductPrice extends PriceAssignmentPayload {
  id: number;
  product_id: number;
  deleted_status: boolean;
  created_on: string;
  updated_on: string;
  price_category_name?: string;
}

export interface Product {
  id: number;
  category_id: number;
  product_name: string;
  item_code: string;
  product_size: string;
  status: boolean;
  deleted_status: boolean;
  created_on: string;
  updated_on: string;
  prices: ProductPrice[];
}

export interface ProductPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ProductListResponse {
  items: Product[];
  pagination: ProductPagination;
}

export interface CreateProductPayload {
  category_id: number;
  product_name: string;
  item_code: string;
  product_size: string;
  status: boolean;
  price_assignments: PriceAssignmentPayload[];
}