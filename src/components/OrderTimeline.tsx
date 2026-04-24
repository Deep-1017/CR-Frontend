import { CheckCircle2, Clock, Truck } from "lucide-react";
import type { DetailOrderStatus, OrderDetailData } from "@/hooks/useOrderDetail";

interface TimelineStep {
  key: "Confirmed" | "Shipped" | "Delivered";
  label: string;
  waitingLabel: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: "Confirmed", label: "Confirmed", waitingLabel: "Awaiting confirmation" },
  { key: "Shipped", label: "Shipped", waitingLabel: "Preparing shipment" },
  { key: "Delivered", label: "Delivered", waitingLabel: "Delivery pending" },
];

const getStepIndex = (status: DetailOrderStatus): number => {
  const statusMap: Record<string, number> = {
    Pending: -1,
    Confirmed: 0,
    Processing: 1,
    Shipped: 1,
    Completed: 2,
    Delivered: 2,
    Cancelled: -1,
  };
  return statusMap[status] ?? -1;
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return null;

  return new Date(date).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const findHistoryDate = (
  order: OrderDetailData,
  keys: string[],
): string | undefined => {
  const event = order.statusHistory.find((entry) =>
    keys.some((key) => entry.status.toLowerCase() === key.toLowerCase()),
  );

  return event?.date ?? event?.timestamp ?? event?.createdAt;
};

interface OrderTimelineProps {
  order: OrderDetailData;
}

const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const currentStepIndex = getStepIndex(order.orderStatus);
  const confirmedAt =
    order.confirmedAt ??
    findHistoryDate(order, ["Confirmed"]) ??
    (currentStepIndex >= 0 ? order.createdAt : undefined);
  const shippedAt =
    order.shippedAt ?? findHistoryDate(order, ["Processing", "Shipped"]);
  const deliveredAt =
    order.deliveredAt ?? findHistoryDate(order, ["Completed", "Delivered"]);

  const stepDates: Record<TimelineStep["key"], string | null> = {
    Confirmed: formatDateTime(confirmedAt),
    Shipped: formatDateTime(shippedAt),
    Delivered: formatDateTime(deliveredAt),
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:break-inside-avoid md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Order Timeline</p>
          <p className="mt-1 text-xs text-stone-500">
            Confirmed to doorstep, with every milestone in one place.
          </p>
        </div>
        <Truck className="hidden h-5 w-5 text-stone-400 sm:block" />
      </div>

      {order.orderStatus === "Cancelled" ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Clock className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-900">Order cancelled</p>
            <p className="text-xs text-red-700">
              {formatDateTime(order.updatedAt) ?? "This order is no longer active."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {TIMELINE_STEPS.map((step, index) => {
            const isComplete = index <= currentStepIndex;
            const isCurrent = index === Math.max(currentStepIndex, 0);
            const isUpcoming = index > currentStepIndex;
            const date = stepDates[step.key];
            const deliveryEta =
              step.key === "Delivered" && !date
                ? formatDateTime(order.estimatedDeliveryDate)
                : null;

            return (
              <div
                key={step.key}
                className={`relative rounded-2xl border p-4 transition-colors ${
                  isCurrent
                    ? "border-stone-900 bg-stone-950 text-white"
                    : isComplete
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-stone-200 bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isCurrent
                        ? "bg-white text-stone-950"
                        : isComplete
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-stone-300"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isUpcoming && !isCurrent ? "text-stone-500" : ""
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs ${
                        isCurrent
                          ? "text-stone-200"
                          : isComplete
                            ? "text-emerald-700"
                            : "text-stone-400"
                      }`}
                    >
                      {date
                        ? `${step.label} on ${date}`
                        : deliveryEta
                          ? `Delivery expected ${deliveryEta}`
                          : step.waitingLabel}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OrderTimeline;
