import { Package } from "lucide-react";
import type { OrderDetailData } from "@/hooks/useOrderDetail";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

interface OrderItemsTableProps {
  order: OrderDetailData;
}

const OrderItemsTable = ({ order }: OrderItemsTableProps) => {
  const subtotal = order.subtotal;
  const shipping = order.shippingCost;
  const tax = order.tax;
  const total = order.totalAmount;

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm print:break-inside-avoid">
      <div className="border-b border-stone-200 bg-stone-50 px-5 py-4 md:px-6">
        <p className="text-sm font-semibold text-stone-900">Items Ordered</p>
        <p className="mt-1 text-xs text-stone-500">
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"} in this order
        </p>
      </div>

      <div className="hidden grid-cols-[1fr_110px_90px_110px] gap-4 border-b border-stone-100 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400 md:grid">
        <span>Product</span>
        <span className="text-right">Unit Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Line Total</span>
      </div>

      <div className="divide-y divide-stone-100">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <Package className="h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">No items in this order</p>
          </div>
        ) : (
          order.items.map((item, idx) => {
            const unitPrice = item.priceAtPurchase || item.price;
            const lineTotal = unitPrice * item.quantity;

            return (
              <div
                key={`${item.productId ?? item.productName}-${idx}`}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_110px_90px_110px] md:items-center md:px-6"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-stone-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Size: {item.configuration} | Color: {item.finish}
                    </p>
                    {item.sku && (
                      <p className="mt-1 font-mono text-[11px] text-stone-400">
                        SKU {item.sku}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm md:block md:text-right">
                  <span className="text-xs text-stone-400 md:hidden">Unit Price</span>
                  <span className="font-medium text-stone-700">
                    {formatAmount(unitPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm md:block md:text-right">
                  <span className="text-xs text-stone-400 md:hidden">Quantity</span>
                  <span className="font-medium text-stone-700">{item.quantity}</span>
                </div>

                <div className="flex items-center justify-between text-sm md:block md:text-right">
                  <span className="text-xs text-stone-400 md:hidden">Line Total</span>
                  <span className="font-semibold text-stone-900">
                    {formatAmount(lineTotal)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-stone-200 bg-stone-50 px-5 py-4 md:px-6">
        <div className="ml-auto max-w-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span className="font-medium text-stone-900">
              {formatAmount(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Shipping</span>
            <span className="font-medium text-stone-900">
              {shipping > 0 ? formatAmount(shipping) : "Free"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Tax/GST</span>
            <span className="font-medium text-stone-900">
              {formatAmount(tax)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-stone-200 pt-3">
            <span className="text-sm font-semibold text-stone-900">
              Grand Total
            </span>
            <span className="text-xl font-bold text-stone-950">
              {formatAmount(total)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderItemsTable;
