import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import api from "@/lib/api";
import type { OrderStatus } from "@/hooks/useOrders";

const orderStatusSchema = z.enum([
  "Pending",
  "Processing",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Shipped",
  "Delivered",
]);

const paymentStatusSchema = z.enum(["pending", "success", "failed"]);

const orderItemSchema = z
  .object({
    productId: z
      .union([
        z.string(),
        z.object({ _id: z.string().optional(), id: z.string().optional() }),
      ])
      .optional(),
    variantId: z.string().optional(),
    name: z.string().optional(),
    productName: z.string().optional(),
    configuration: z.string().optional(),
    size: z.string().optional(),
    finish: z.string().optional(),
    color: z.string().optional(),
    quantity: z.coerce.number().int().nonnegative().default(0),
    priceAtPurchase: z.coerce.number().nonnegative().optional(),
    price: z.coerce.number().nonnegative().optional(),
    sku: z.string().optional(),
    image: z.string().optional(),
  })
  .transform((item) => {
    const productId =
      typeof item.productId === "string"
        ? item.productId
        : (item.productId?._id ?? item.productId?.id);

    return {
      productId,
      variantId: item.variantId,
      productName: item.productName ?? item.name ?? "Product",
      configuration: item.configuration ?? item.size ?? "Standard",
      finish: item.finish ?? item.color ?? "Default",
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase ?? item.price ?? 0,
      price: item.price ?? item.priceAtPurchase ?? 0,
      sku: item.sku,
      image: item.image ?? "",
    };
  });

const timelineEventSchema = z.object({
  status: z.string(),
  label: z.string().optional(),
  date: z.string().optional(),
  timestamp: z.string().optional(),
  createdAt: z.string().optional(),
});

const trackingSchema = z.object({
  carrier: z.string().optional(),
  carrierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  estimatedDeliveryDate: z.string().nullable().optional(),
  currentLocation: z.string().optional(),
});

const rawOrderSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    orderNumber: z.string().optional(),
    totalAmount: z.coerce.number().nonnegative(),
    subtotal: z.coerce.number().nonnegative().optional(),
    shippingCost: z.coerce.number().nonnegative().optional(),
    shipping: z.coerce.number().nonnegative().optional(),
    tax: z.coerce.number().nonnegative().optional(),
    gst: z.coerce.number().nonnegative().optional(),
    status: orderStatusSchema.optional(),
    orderStatus: orderStatusSchema.optional(),
    paymentStatus: paymentStatusSchema.default("pending"),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    confirmedAt: z.string().optional(),
    shippedAt: z.string().optional(),
    deliveredAt: z.string().optional(),
    estimatedDeliveryDate: z.string().nullable().optional(),
    itemCount: z.coerce.number().int().nonnegative().optional(),
    items: z.array(orderItemSchema).default([]),
    customer: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
      })
      .optional(),
    paymentId: z.string().optional(),
    transactionId: z.string().optional(),
    paymentMethod: z.string().optional(),
    amountPaid: z.coerce.number().nonnegative().optional(),
    paymentDetails: z
      .object({
        provider: z.string().optional(),
        paymentIntentId: z.string().optional(),
        razorpayOrderId: z.string().optional(),
        status: z.string().optional(),
      })
      .optional(),
    tracking: trackingSchema.optional(),
    trackingInfo: trackingSchema.optional(),
    statusHistory: z.array(timelineEventSchema).optional(),
    timeline: z.array(timelineEventSchema).optional(),
  })
  .transform((order) => {
    const id = order._id ?? order.id ?? "";
    const normalizedStatus = order.orderStatus ?? order.status ?? "Pending";

    return {
      ...order,
      _id: id,
      orderNumber: order.orderNumber ?? `#ORD-${id.slice(-6).toUpperCase()}`,
      orderStatus: normalizedStatus as OrderStatus | "Shipped" | "Delivered",
      itemCount: order.itemCount ?? order.items.length,
      subtotal:
        order.subtotal ??
        order.items.reduce(
          (sum, item) => sum + item.priceAtPurchase * item.quantity,
          0,
        ),
      shippingCost: order.shippingCost ?? order.shipping ?? 0,
      tax: order.tax ?? order.gst ?? 0,
      amountPaid: order.amountPaid ?? order.totalAmount,
      tracking: order.tracking ?? order.trackingInfo,
      statusHistory: order.statusHistory ?? order.timeline ?? [],
    };
  });

export type OrderDetailItem = z.infer<typeof orderItemSchema>;
export type OrderDetailData = z.infer<typeof rawOrderSchema>;
export type DetailOrderStatus = OrderDetailData["orderStatus"];

const orderDetailResponseSchema = z
  .union([
    rawOrderSchema,
    z.object({ order: rawOrderSchema }),
    z.object({ data: rawOrderSchema }),
  ])
  .transform((payload) => {
    if ("order" in payload) return payload.order;
    if ("data" in payload) return payload.data;
    return payload;
  });

const fetchOrderDetail = async (
  orderId: string,
): Promise<OrderDetailData> => {
  const { data } = await api.get<unknown>(`/orders/${orderId}`);
  return orderDetailResponseSchema.parse(data);
};

export const useOrderDetail = (orderId: string | undefined) => {
  return useQuery<OrderDetailData, Error>({
    queryKey: ["order-detail", orderId],
    queryFn: () => {
      if (!orderId) throw new Error("Order ID is required");
      return fetchOrderDetail(orderId);
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      const status = (error as any)?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};
