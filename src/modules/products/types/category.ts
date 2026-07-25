export interface Category {
  id: number;
  category_name: string;
  status: boolean;
  deleted_status: boolean;
  created_on: string;
  updated_on: string;
}

export interface PriceCategory {
  id: number;
  price_category_name: string;
  status: boolean;
  deleted_status: boolean;
  created_on: string;
  updated_on: string;
}