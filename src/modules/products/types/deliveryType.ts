// src/modules/products/types/deliveryType.ts

export interface DeliveryType {
  id: number;
  name: string;
  status: boolean;
  created_on?: string;
}

export interface DeliveryTypePayload {
  name: string;
  status: boolean;
}
