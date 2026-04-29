import axios from "axios";

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const cleaned = (rawUrl || "http://localhost:5000").replace(/\/+$/, "");
  return cleaned.endsWith("/api/v1") ? cleaned : `${cleaned}/api/v1`;
};

const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      window.localStorage.getItem("auth_token") ??
      window.localStorage.getItem("authToken") ??
      window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      window.localStorage.removeItem("auth_token");
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("token");

      const isAuthPage =
        window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/register") ||
        window.location.pathname.includes("/forgot-password") ||
        window.location.pathname.includes("/reset-password");

      if (!isAuthPage) {
        const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.href = `/login?session=expired&redirect=${encodeURIComponent(returnUrl)}`;
      }
    }

    return Promise.reject(error);
  },
);

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
  token: string;
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
