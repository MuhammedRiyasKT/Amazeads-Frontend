export interface ProductRow {
  id: string;
  productName: string;
  section: string;
  imageUrl: string;
  qty: number;
  price: number;
  addlAmt: number;
}

// src/modules/sales/types/index.ts

export interface OrderItem {
  productName: string;
  qty: number;
  status: "ORDER" | "PROJECT";
}

export interface Order {
  id: string;
  orderId?: string;
  date: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentStatus: "PAID" | "DUE" | "PARTIAL";
  paidAmount?: number; // കൂട്ടിച്ചേർത്തത്
  dueAmount?: number;  // കൂട്ടിച്ചേർത്തത്
  isToday?: boolean;
  isConverted?: boolean;
  isPending?: boolean;
}