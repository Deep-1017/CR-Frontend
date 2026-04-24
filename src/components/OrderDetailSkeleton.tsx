const OrderDetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Header */}
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="space-y-3">
        <div className="h-6 w-40 rounded-full bg-stone-200" />
        <div className="h-4 w-52 rounded-full bg-stone-100" />
        <div className="h-4 w-32 rounded-full bg-stone-100" />
      </div>
    </div>

    {/* Timeline */}
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="h-4 w-32 rounded-full bg-stone-200 mb-4" />
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-stone-200" />
            <div className="h-3 w-20 rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
    </div>

    {/* Items table */}
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="h-4 w-24 rounded-full bg-stone-200 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-lg bg-stone-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-full bg-stone-200" />
              <div className="h-3 w-24 rounded-full bg-stone-100" />
            </div>
            <div className="h-4 w-16 rounded-full bg-stone-200" />
          </div>
        ))}
      </div>
    </div>

    {/* Address card */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
        <div className="h-4 w-32 rounded-full bg-stone-200" />
        <div className="space-y-2">
          <div className="h-3 w-40 rounded-full bg-stone-100" />
          <div className="h-3 w-48 rounded-full bg-stone-100" />
          <div className="h-3 w-36 rounded-full bg-stone-100" />
        </div>
      </div>

      {/* Payment card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
        <div className="h-4 w-32 rounded-full bg-stone-200" />
        <div className="space-y-2">
          <div className="h-3 w-40 rounded-full bg-stone-100" />
          <div className="h-3 w-48 rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  </div>
);

export default OrderDetailSkeleton;
