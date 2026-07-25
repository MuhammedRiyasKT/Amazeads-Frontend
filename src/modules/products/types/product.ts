export interface ProductPrice {
  id: number;
  product_id: number;
  price_category_id: number;
  selling_price: number;
  status: boolean;
  deleted_status: boolean;
  created_on: string;
  updated_on: string;
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
  material_price: number;
  printing_price: number;
  ads_price: number;
  profit: number;
  cutting_price: number;
  packing: number;
  other: number;
  gst: number;
  sqft: number;
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

export interface PriceAssignmentPayload {
  price_category_id: number;
  selling_price: number;
  status: boolean;
}

export interface CreateProductPayload {
  category_id: number;
  product_name: string;
  item_code: string;
  product_size: string;
  status: boolean;
  material_price: number;
  printing_price: number;
  ads_price: number;
  profit: number;
  cutting_price: number;
  packing: number;
  other: number;
  gst: number;
  sqft: number;
  price_assignments: PriceAssignmentPayload[];
}