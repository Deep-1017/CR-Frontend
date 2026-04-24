import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/hooks/useOrders";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  Processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  Confirmed: {
    label: "Confirmed",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-400",
  },
  Completed: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-stone-100 text-stone-500 border-stone-200",
    dot: "bg-stone-400",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderListItemProps {
  order: Order;
}

const OrderListItem = ({ order }: OrderListItemProps) => {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.Pending;
  const canTrack = ["Processing", "Confirmed"].includes(order.orderStatus);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/orders/${order._id}`);
  };

  return (
    <div
      onClick={() => navigate(`/orders/${order._id}`)}
      className="group relative cursor-pointer rounded-2xl border border-stone-200 bg-white p-5 shadow-sm
                 transition-all duration-200 hover:border-stone-300 hover:shadow-md"
    >
      {/* ── Top row ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-stone-900">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Status badge */}
        <Badge
          variant="outline"
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.className}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </Badge>
      </div>

      {/* ── Product images ───────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-2">
        {order.items.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.productName}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23f5f5f4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23a8a29e"%3E📦%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-6 w-6 text-stone-300" />
              </div>
            )}
          </div>
        ))}

        {/* Overflow indicator */}
        {order.itemCount > 3 && (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50">
            <span className="text-xs font-medium text-stone-400">
              +{order.itemCount - 3}
            </span>
          </div>
        )}

        {/* Item count pill */}
        <span className="ml-auto shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="space-y-0.5">
          {/* Estimated delivery */}
          {order.estimatedDeliveryDate ? (
            <p className="flex items-center gap-1 text-[11px] text-stone-400">
              <MapPin className="h-3 w-3" />
              Est. delivery {formatShortDate(order.estimatedDeliveryDate)}
            </p>
          ) : (
            order.orderStatus !== "Cancelled" && (
              <p className="text-[11px] text-stone-400">Delivery date TBD</p>
            )
          )}
          <p className="text-base font-semibold text-stone-900">
            {formatAmount(order.totalAmount)}
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="flex shrink-0 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {canTrack && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-stone-200 px-3 text-xs text-stone-600 hover:bg-stone-50"
              onClick={handleViewDetails}
            >
              Track Order
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-full bg-stone-900 px-3 text-xs text-white hover:bg-stone-800"
            onClick={handleViewDetails}
          >
            View Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderListItem;
