import api from "@/lib/api";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

export type SupportedCountry = "India";

export type Address = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: IndianState;
  zipCode: string;
  country: SupportedCountry;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressInput = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: IndianState;
  zipCode: string;
  country?: SupportedCountry;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;

export const listAddresses = async (): Promise<Address[]> => {
  const response = await api.get<Address[]>("/users/addresses");
  return response.data;
};

export const createAddress = async (payload: CreateAddressInput): Promise<Address> => {
  const response = await api.post<Address>("/users/addresses", {
    ...payload,
    country: payload.country ?? "India",
  });
  return response.data;
};

export const updateAddress = async (addressId: string, payload: UpdateAddressInput): Promise<Address> => {
  const response = await api.patch<Address>(`/users/addresses/${addressId}`, payload);
  return response.data;
};

export const deleteAddress = async (addressId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/users/addresses/${addressId}`);
  return response.data;
};

export const setDefaultAddress = async (addressId: string): Promise<Address> => {
  const response = await api.patch<Address>(`/users/addresses/${addressId}/set-default`);
  return response.data;
};

