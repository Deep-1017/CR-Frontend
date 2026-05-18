import api from "./axios";

// Re-export the shared axios instance so all services use the same interceptor.
// This file adds domain-specific helper functions on top.

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data.products;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  rating?: string;
}

export const getProductReviews = async (productId: string, params: GetReviewsParams = {}) => {
  const response = await api.get(`/products/${productId}/reviews`, { params });
  return response.data;
};

export interface CreateReviewPayload {
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export const createProductReview = async (productId: string, data: CreateReviewPayload) => {
  const response = await api.post(`/products/${productId}/reviews`, data);
  return response.data;
};

export const updateReview = async (reviewId: string, data: CreateReviewPayload) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const voteReview = async (productId: string, reviewId: string, type: "helpful" | "notHelpful" | null) => {
  const response = await api.post(`/products/${productId}/reviews/${reviewId}/vote`, { type });
  return response.data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = async (orderData: unknown) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
}

export const getOrders = async (params: GetOrdersParams = {}) => {
  const response = await api.get("/orders", { params });
  return response.data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "admin";
  };
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
};

export default api;
