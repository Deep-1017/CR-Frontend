import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "all"
  | "Pending"
  | "Processing"
  | "Confirmed"
  | "Completed"
  | "Cancelled";
export type SortBy = "recent" | "oldest" | "amount-high" | "amount-low";

export interface OrderItem {
  productName: string;
  configuration: string;
  finish: string;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: "pending" | "success" | "failed";
  createdAt: string;
  estimatedDeliveryDate: string | null;
  itemCount: number;
  items: OrderItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface UseOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: SortBy;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetchOrders = async (
  params: UseOrdersParams,
): Promise<OrdersResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);

  const { data } = await api.get<OrdersResponse>(
    `/orders?${searchParams.toString()}`,
  );
  return data;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useOrders = (params: UseOrdersParams = {}) => {
  const { page = 1, limit = 10, status = "all", sortBy = "recent" } = params;

  return useQuery<OrdersResponse, Error>({
    queryKey: ["orders", page, limit, status, sortBy],
    queryFn: () => fetchOrders({ page, limit, status, sortBy }),
    staleTime: 1000 * 60 * 2, // 2 min — orders don't change that fast
    gcTime: 1000 * 60 * 5, // 5 min cache
    retry: (failureCount, error) => {
      // Don't retry on 401/403 — let the axios interceptor handle redirects
      const status = (error as any)?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};
