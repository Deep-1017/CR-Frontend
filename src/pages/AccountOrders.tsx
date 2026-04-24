import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderListItem from "@/components/OrderListItem";
import OrderSkeleton from "@/components/OrderSkeleton";
import { useOrders, type OrderStatus, type SortBy } from "@/hooks/useOrders";

// ─── Filter tabs config ───────────────────────────────────────────────────────

const FILTERS: { label: string; value: OrderStatus }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Processing", value: "Processing" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Most Recent", value: "recent" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: High to Low", value: "amount-high" },
  { label: "Price: Low to High", value: "amount-low" },
];

const LIMIT = 10;

// ─── Component ────────────────────────────────────────────────────────────────

const AccountOrders = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const { data, isLoading, isError, error, refetch, isFetching } = useOrders({
    page,
    limit: LIMIT,
    status,
    sortBy,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: LIMIT,
    totalOrders: 0,
    totalPages: 0,
  };

  // Reset to page 1 when filters/sort change
  const handleStatusChange = (value: OrderStatus) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortChange = (value: SortBy) => {
    setSortBy(value);
    setPage(1);
  };

  // ── Auth error — axios interceptor handles redirect, but handle gracefully ──
  const isAuthError = (error as any)?.response?.status === 401;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />

      <main className="container mx-auto px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* ── Page header ─────────────────────────────────────────────────── */}
          <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(28,25,23,0.06)] md:px-8">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-400">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
              Your Orders
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
              Track, manage and review all your past and current orders.
            </p>
          </section>

          {/* ── Controls: filters + sort ─────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleStatusChange(f.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150
                    ${
                      status === f.value
                        ? "bg-stone-900 text-white shadow-sm"
                        : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <Select
              value={sortBy}
              onValueChange={(v) => handleSortChange(v as SortBy)}
            >
              <SelectTrigger className="h-8 w-full rounded-full border-stone-200 text-xs sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Results count ────────────────────────────────────────────────── */}
          {!isLoading && !isError && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-400">
                {pagination.totalOrders === 0
                  ? "No orders found"
                  : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalOrders,
                    )} of ${pagination.totalOrders} order${pagination.totalOrders !== 1 ? "s" : ""}`}
              </p>
              {isFetching && !isLoading && (
                <RefreshCw className="h-3 w-3 animate-spin text-stone-400" />
              )}
            </div>
          )}

          {/* ── States ──────────────────────────────────────────────────────── */}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && !isAuthError && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-6 py-12 text-center">
              <PackageSearch className="h-10 w-10 text-rose-300" />
              <p className="mt-4 text-base font-medium text-stone-900">
                Couldn't load your orders
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {(error as any)?.response?.data?.message ??
                  "Something went wrong. Please try again."}
              </p>
              <Button
                className="mt-5 rounded-full bg-stone-900 text-white hover:bg-stone-800"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && orders.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-14 text-center">
              <ShoppingBag className="h-10 w-10 text-stone-300" />
              <p className="mt-4 text-base font-medium text-stone-900">
                {status === "all"
                  ? "No orders yet"
                  : `No ${status.toLowerCase()} orders`}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {status === "all"
                  ? "Once you place an order, it will appear here."
                  : "Try a different filter to see more orders."}
              </p>
              {status === "all" && (
                <Button
                  className="mt-5 rounded-full bg-stone-900 text-white hover:bg-stone-800"
                  onClick={() => navigate("/shop")}
                >
                  Start Shopping
                </Button>
              )}
            </div>
          )}

          {/* ── Order list ──────────────────────────────────────────────────── */}
          {!isLoading && !isError && orders.length > 0 && (
            <div
              className={`space-y-3 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}
            >
              {orders.map((order) => (
                <OrderListItem key={order._id} order={order} />
              ))}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────────── */}
          {!isLoading && !isError && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 rounded-full p-0 border-stone-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-xs text-stone-500">
                Page{" "}
                <span className="font-semibold text-stone-900">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-stone-900">
                  {pagination.totalPages}
                </span>
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 rounded-full p-0 border-stone-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ── Footer actions ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              className="rounded-full bg-stone-900 text-white hover:bg-stone-800"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-stone-300 text-stone-700 hover:bg-stone-100"
              onClick={() => navigate("/account")}
            >
              Back to Account
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountOrders;
