// src/modules/products/services/deliveryType.service.ts

import api from "@/lib/axios";
import { DeliveryType, DeliveryTypePayload } from "../types/deliveryType";

export const getDeliveryTypes = async (): Promise<DeliveryType[]> => {
  const response = await api.get("/admin/delivery-type");
  return response.data;
};

export const createDeliveryType = async (
  payload: DeliveryTypePayload
): Promise<DeliveryType> => {
  const response = await api.post("/admin/delivery-type", payload);
  return response.data;
};

export const updateDeliveryType = async (
  id: number,
  payload: DeliveryTypePayload
): Promise<DeliveryType> => {
  const response = await api.put(`/admin/delivery-type/${id}`, payload);
  return response.data;
};

export const deleteDeliveryType = async (id: number): Promise<void> => {
  await api.delete(`/admin/delivery-type/${id}`);
};
