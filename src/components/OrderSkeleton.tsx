const OrderSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
    {/* Top row: order number + badge */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded-full bg-stone-200" />
        <div className="h-3 w-36 rounded-full bg-stone-100" />
      </div>
      <div className="h-6 w-20 rounded-full bg-stone-200" />
    </div>

    {/* Images row */}
    <div className="mt-4 flex gap-2">
      <div className="h-16 w-16 rounded-xl bg-stone-200" />
      <div className="h-16 w-16 rounded-xl bg-stone-100" />
      <div className="h-16 w-16 rounded-xl bg-stone-100" />
    </div>

    {/* Bottom row: price + button */}
    <div className="mt-4 flex items-center justify-between">
      <div className="space-y-1">
        <div className="h-3 w-16 rounded-full bg-stone-100" />
        <div className="h-5 w-24 rounded-full bg-stone-200" />
      </div>
      <div className="h-9 w-28 rounded-full bg-stone-200" />
    </div>
  </div>
);

export default OrderSkeleton;
