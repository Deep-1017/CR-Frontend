import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { addBusinessDays, format } from "date-fns";
import {
  CheckCheck,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Mail,
  MapPin,
  PackageCheck,
  Printer,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/axios";
import { readLastOrderSnapshot } from "@/lib/lastOrder";
import { formatINR } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { z } from "zod";
import productHeadphonesImage from "@/assets/product-headphones.jpg";
import { resendOrderConfirmationEmail } from "@/services/paymentService";

const localOrderImageModules = import.meta.glob("../assets/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const readNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const OrderSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  customer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      name: z.string(),
      configuration: z.string(),
      finish: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      sku: z.string(),
      image: z.string(),
    })
  ),
  totalAmount: z.number(),
  paymentStatus: z.enum(["pending", "success", "failed"]),
  transactionId: z.string().optional(),
  paymentMethod: z.enum(["razorpay", "upi", "card"]),
  amountPaid: z.number(),
  paymentDetails: z.object({
    provider: z.string(),
    paymentIntentId: z.string().optional(),
    razorpayOrderId: z.string().optional(),
    status: z.enum(["pending", "paid", "failed", "refunded"]),
  }),
  status: z.enum(["Pending", "Processing", "Confirmed", "Completed", "Cancelled"]),
  confirmationEmailSentAt: z.string().optional(),
  confirmationEmailError: z.string().optional(),
});

type Order = z.infer<typeof OrderSchema>;

const normalizeOrder = (value: unknown, fallbackId: string): Order => {
  const source = isRecord(value) ? value : {};
  const customer = isRecord(source.customer) ? source.customer : {};
  const paymentDetails = isRecord(source.paymentDetails) ? source.paymentDetails : {};
  const rawItems = Array.isArray(source.items) ? source.items : [];

  return OrderSchema.parse({
    id: readString(source.id) ?? readString(source._id) ?? fallbackId,
    createdAt: readString(source.createdAt) ?? new Date().toISOString(),
    customer: {
      firstName: readString(customer.firstName) ?? "Customer",
      lastName: readString(customer.lastName) ?? "",
      email: readString(customer.email) ?? "",
      phone: readString(customer.phone),
      address: readString(customer.address),
      city: readString(customer.city),
      state: readString(customer.state),
      zipCode: readString(customer.zipCode),
    },
    items: rawItems.map((item, index) => {
      const entry = isRecord(item) ? item : {};
      return {
        productId: readString(entry.productId) ?? `product-${index}`,
        variantId: readString(entry.variantId) ?? `variant-${index}`,
        name: readString(entry.name) ?? "Product",
        configuration: readString(entry.configuration) ?? "Standard",
        finish: readString(entry.finish) ?? "Default",
        quantity: readNumber(entry.quantity) ?? 1,
        unitPrice: readNumber(entry.priceAtPurchase) ?? readNumber(entry.price) ?? 0,
        sku: readString(entry.sku) ?? `sku-${index}`,
        image: resolveOrderImageUrl(readString(entry.image) ?? "/placeholder.svg"),
      };
    }),
    totalAmount: readNumber(source.totalAmount) ?? 0,
    paymentStatus:
      readString(source.paymentStatus) === "success" || readString(source.paymentStatus) === "failed"
        ? (readString(source.paymentStatus) as "success" | "failed")
        : "pending",
    transactionId: readString(source.transactionId),
    paymentMethod:
      readString(source.paymentMethod) === "upi" || readString(source.paymentMethod) === "card"
        ? (readString(source.paymentMethod) as "upi" | "card")
        : "razorpay",
    amountPaid: readNumber(source.amountPaid) ?? readNumber(source.totalAmount) ?? 0,
    paymentDetails: {
      provider: readString(paymentDetails.provider) ?? "razorpay",
      paymentIntentId: readString(paymentDetails.paymentIntentId),
      razorpayOrderId: readString(paymentDetails.razorpayOrderId),
      status:
        readString(paymentDetails.status) === "paid" ||
        readString(paymentDetails.status) === "failed" ||
        readString(paymentDetails.status) === "refunded"
          ? (readString(paymentDetails.status) as "paid" | "failed" | "refunded")
          : "pending",
    },
    status:
      readString(source.status) === "Processing" ||
      readString(source.status) === "Confirmed" ||
      readString(source.status) === "Completed" ||
      readString(source.status) === "Cancelled"
        ? (readString(source.status) as "Processing" | "Confirmed" | "Completed" | "Cancelled")
        : "Pending",
    confirmationEmailSentAt: readString(source.confirmationEmailSentAt),
    confirmationEmailError: readString(source.confirmationEmailError),
  });
};

const formatOrderTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getBackendOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
};

const resolveOrderImageUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return productHeadphonesImage;
  if (
    /^https?:\/\//i.test(trimmedValue) ||
    trimmedValue.startsWith("data:") ||
    trimmedValue.startsWith("blob:")
  ) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("/assets/")) {
    const assetName = trimmedValue.split("/").filter(Boolean).at(-1)?.toLowerCase();
    if (assetName) {
      const matchedEntry = Object.entries(localOrderImageModules).find(([path]) =>
        path.split("/").at(-1)?.toLowerCase() === assetName
      );

      if (matchedEntry) {
        return matchedEntry[1];
      }
    }

    return productHeadphonesImage;
  }

  const normalizedPath = trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
  return `${getBackendOrigin()}${normalizedPath}`;
};

const getPaymentMethodLabel = (method: Order["paymentMethod"], provider: string) => {
  if (method === "card") return "Card";
  if (method === "upi") return "UPI";
  if (provider.trim()) {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
  return "Razorpay";
};

const OrderConfirmationSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-live="polite">
    <Card className="border-emerald-100 bg-white shadow-[0_18px_50px_rgba(21,128,61,0.08)]">
      <CardContent className="space-y-5 px-6 py-8 md:px-8">
        <Skeleton className="h-20 w-20 rounded-full bg-emerald-100/70" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </CardContent>
    </Card>
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 px-6 py-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 px-6 py-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-3 px-6 py-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full rounded-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 px-6 py-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const OrderConfirmation = () => {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { confirmedOrderId, clearConfirmedOrder } = useOrder();
  
  // All state hooks must be called unconditionally at the top level
  const [localConfirmationSentAt, setLocalConfirmationSentAt] = useState<string | undefined>();
  const [localConfirmationError, setLocalConfirmationError] = useState<string | undefined>();
  
  // All memoized values must be called unconditionally
  const lastOrderSnapshot = useMemo(() => readLastOrderSnapshot(), []);
  const isNewConfirmation = searchParams.get('new') === 'true';
  
  const normalizedUserEmail = user?.email.trim().toLowerCase() ?? "";
  const hasOrderAccess = Boolean(orderId) && Boolean(isAuthenticated);
  const isConfirmedOrder = confirmedOrderId === orderId;

  // All query hooks must be called unconditionally
  const orderQuery = useQuery<Order>({
    queryKey: ["order-confirmation", orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return normalizeOrder(response.data, orderId);
    },
    enabled: hasOrderAccess,
    retry: false,
  });

  const orderError = orderQuery.error as AxiosError<{ message?: string }> | null;
  const errorStatus = orderError?.response?.status;
  const returnUrl = `${location.pathname}${location.search}${location.hash}`;

  // All effect hooks must be called unconditionally
  useEffect(() => {
    if (isNewConfirmation && isConfirmedOrder) {
      // Clear the confirmed order state for new confirmations to prevent back button loops
      clearConfirmedOrder();
    }
  }, [isNewConfirmation, isConfirmedOrder, clearConfirmedOrder]);

  useEffect(() => {
    if (hasOrderAccess) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }

    toast({
      title: "Access denied",
      description: "You don't have permission to view this order.",
      variant: "destructive",
    });
    navigate("/", { replace: true });
  }, [hasOrderAccess, isAuthenticated, navigate, toast, location, clearConfirmedOrder]);

  useEffect(() => {
    // Prevent back button loop: if user navigates back to confirmation page after it was cleared
    if (isNewConfirmation) return; // Allow new confirmations
    if (!hasOrderAccess) return; // Let other effects handle
    if (orderQuery.isLoading || orderQuery.isError) return;

    const order = orderQuery.data;
    if (order && order.status === 'Confirmed') {
      toast({
        title: "Order already confirmed",
        description: "This order has already been confirmed. View your orders in your account.",
        variant: "default",
      });
      navigate("/account/orders", { replace: true });
    }
  }, [isNewConfirmation, hasOrderAccess, orderQuery.isLoading, orderQuery.isError, orderQuery.data, toast, navigate]);

  useEffect(() => {
    if (!orderError) return;
    if (errorStatus !== 401) return;

    navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`, { replace: true });
  }, [errorStatus, navigate, orderError, returnUrl]);

  // All mutation hooks must be called unconditionally BEFORE any conditional returns
  const resendConfirmationMutation = useMutation({
    mutationFn: async () => resendOrderConfirmationEmail(orderQuery.data?.id ?? orderId),
    onSuccess: (response) => {
      setLocalConfirmationSentAt(response.confirmationEmailSentAt ?? new Date().toISOString());
      setLocalConfirmationError(undefined);
      toast({
        title: "Confirmation sent",
        description: response.message,
      });
      void orderQuery.refetch();
    },
    onError: (error: Error) => {
      setLocalConfirmationError(error.message);
      toast({
        title: "Unable to send confirmation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // NOW we can have conditional returns after all hooks are called
  if (!hasOrderAccess) {
    return null;
  }

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6f1] print:bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8 md:px-8 md:py-10">
          <OrderConfirmationSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    const isNotFound = errorStatus === 404;

    return (
      <div className="min-h-screen bg-[#f7f6f1] print:bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 md:px-8">
          <div className="mx-auto max-w-xl">
            <Alert
              className={
                isNotFound
                  ? "border-stone-200 bg-white text-stone-900"
                  : "border-red-200 bg-red-50 text-red-900"
              }
            >
              <CircleAlert className="h-4 w-4" />
              <AlertTitle>{isNotFound ? "Order not found" : "Unable to load order"}</AlertTitle>
              <AlertDescription>
                {isNotFound
                  ? "We couldn't find that order. It may have been removed or the link may be incomplete."
                  : orderError?.message || "A network issue prevented us from loading this order right now."}
              </AlertDescription>
            </Alert>
            <div className="mt-6 flex flex-wrap gap-3">
              {isNotFound ? (
                <Button
                  className="rounded-full bg-stone-900 px-6 hover:bg-stone-800"
                  onClick={() => navigate("/")}
                >
                  Go Home
                </Button>
              ) : (
                <Button
                  className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                  onClick={() => orderQuery.refetch()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const order = orderQuery.data;
  const itemSubtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const pricing = lastOrderSnapshot?.pricing && lastOrderSnapshot.orderId === order.id
    ? lastOrderSnapshot.pricing
    : {
        subtotal: itemSubtotal,
        tax: Math.max(order.totalAmount - itemSubtotal, 0),
        shipping: 0,
        total: order.totalAmount,
      };
  const shippingAddress = [order.customer.address, order.customer.city, order.customer.state, order.customer.zipCode]
    .filter(Boolean)
    .join(", ");
  const estimatedDelivery = addBusinessDays(new Date(order.createdAt), 5);
  const transactionId =
    order.transactionId ??
    order.paymentDetails.paymentIntentId ??
    order.paymentDetails.razorpayOrderId ??
    "Pending";
  const confirmationEmailSentAt = localConfirmationSentAt ?? order.confirmationEmailSentAt;
  const confirmationEmailError = localConfirmationError ?? order.confirmationEmailError;

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-stone-900 print:bg-white">
      <style>{`
        @media print {
          header, footer, .no-print {
            display: none !important;
          }

          main {
            padding: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border-color: #d6d3d1 !important;
            break-inside: avoid;
          }
        }
      `}</style>
      <Header />
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <section className="space-y-6">
            <Card className="print-card overflow-hidden border-emerald-100 bg-gradient-to-br from-white via-emerald-50/80 to-lime-50 shadow-[0_24px_70px_rgba(21,128,61,0.10)]">
              <CardContent className="px-6 py-8 md:px-8 md:py-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative mt-1">
                      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-300/40" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="h-10 w-10 animate-in zoom-in-75 duration-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
                          Purchase Complete
                        </p>
                        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
                          Order Confirmed!
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 md:text-base">
                          Thank you for your purchase. We're processing your order.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 backdrop-blur">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Order ID</p>
                          <p className="mt-1 break-all text-base font-semibold text-stone-950">{order.id}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 backdrop-blur">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Placed On</p>
                          <p className="mt-1 text-base font-semibold text-stone-950">
                            {formatOrderTimestamp(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="no-print flex gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full border-stone-300 bg-white/90 text-stone-700 hover:bg-stone-100"
                      onClick={() => window.print()}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Receipt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="print-card border-stone-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-stone-950">
                  <PackageCheck className="h-5 w-5 text-emerald-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {order.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}-${item.sku}`}
                    className="flex gap-4 rounded-2xl border border-stone-100 p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = productHeadphonesImage;
                      }}
                      className="h-20 w-20 rounded-2xl border border-stone-100 object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-stone-950">{item.name}</p>
                        <p className="text-sm text-stone-500">
                          {item.configuration} / {item.finish}
                        </p>
                        <p className="text-sm text-stone-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm text-stone-500">Unit price</p>
                        <p className="font-medium text-stone-900">{formatINR(item.unitPrice)}</p>
                        <p className="mt-2 text-sm text-stone-500">Line total</p>
                        <p className="text-base font-semibold text-stone-950">
                          {formatINR(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl bg-stone-50 p-5">
                  <div className="space-y-2 text-sm text-stone-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatINR(pricing.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span>{pricing.shipping > 0 ? formatINR(pricing.shipping) : "Free"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax / GST</span>
                      <span>{pricing.tax > 0 ? formatINR(pricing.tax) : "Included"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                    <span className="text-base font-semibold text-stone-950">Grand total</span>
                    <span className="text-xl font-semibold text-emerald-700">{formatINR(pricing.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="print-card border-stone-200 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-stone-950">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-stone-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Shipping address</p>
                    <p className="mt-2 text-base font-medium text-stone-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="mt-1 leading-6 text-stone-600">
                      {shippingAddress || "Shipping address will appear here once the order is packed."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Estimated delivery</p>
                    <p className="mt-1 text-base font-semibold">
                      {format(estimatedDelivery, "EEE, MMM d")} <span className="font-normal">(Est. 3-5 business days)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Carrier</p>
                    <p className="mt-2 text-base font-medium text-stone-900">
                      {order.status === "Confirmed" || order.status === "Processing"
                        ? "Carrier details will appear once shipped."
                        : "Awaiting dispatch"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="print-card border-stone-200 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-stone-950">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-stone-600">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Payment method</p>
                      <p className="mt-2 text-base font-medium text-stone-900">
                        {getPaymentMethodLabel(order.paymentMethod, order.paymentDetails.provider)}
                      </p>
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50">
                      <CheckCheck className="mr-1 h-3.5 w-3.5" />
                      Payment Successful
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Transaction ID</p>
                    <p className="mt-2 break-all text-base font-medium text-stone-900">{transactionId}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Amount paid</p>
                    <p className="mt-2 text-base font-medium text-stone-900">{formatINR(order.amountPaid)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="print-card border-stone-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-stone-950">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  Email Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-stone-600">
                <div className={`rounded-2xl border px-4 py-3 ${
                  confirmationEmailSentAt 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : confirmationEmailError 
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {confirmationEmailSentAt ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : confirmationEmailError ? (
                        <CircleAlert className="h-5 w-5 text-red-600" />
                      ) : (
                        <Mail className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs uppercase tracking-[0.18em] ${
                        confirmationEmailSentAt 
                          ? 'text-emerald-700' 
                          : confirmationEmailError 
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}>
                        {confirmationEmailSentAt ? 'Email Sent' : confirmationEmailError ? 'Email Error' : 'Email Pending'}
                      </p>
                      <p className={`mt-2 text-base font-medium ${
                        confirmationEmailSentAt 
                          ? 'text-emerald-950' 
                          : confirmationEmailError 
                          ? 'text-red-950'
                          : 'text-amber-950'
                      }`}>
                        {confirmationEmailSentAt
                          ? `✓ Confirmation email sent to ${order.customer.email}`
                          : confirmationEmailError
                          ? `We couldn't send the confirmation automatically`
                          : `Confirmation email is pending for ${order.customer.email}`}
                      </p>
                      {confirmationEmailSentAt ? (
                        <p className="mt-1 text-sm text-emerald-700">
                          Sent on {formatOrderTimestamp(confirmationEmailSentAt)}
                        </p>
                      ) : null}
                      {confirmationEmailError ? (
                        <p className="mt-1 text-sm text-red-700">
                          {confirmationEmailError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm leading-6">
                    {confirmationEmailError
                      ? "Didn't receive the email? Check your spam folder or use the resend button below."
                      : "Your email is on file and tied to this order. Check your inbox or spam folder for the confirmation details."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className={`w-full rounded-full border-2 ${
                    confirmationEmailSentAt
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                  onClick={() => resendConfirmationMutation.mutate()}
                  disabled={resendConfirmationMutation.isPending}
                >
                  {resendConfirmationMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending confirmation...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Confirmation Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="print-card border-stone-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-stone-950">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  What happens next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-3 text-sm leading-6 text-stone-600">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                    <span>Order is being prepared</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                    <span>You'll receive shipping notification via email</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                    <span>Track order in your account</span>
                  </li>
                </ul>
                <div className="no-print flex flex-col gap-3">
                  <Button
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => navigate("/account/orders")}
                  >
                    View My Orders
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-stone-300 text-stone-700 hover:bg-stone-100"
                    onClick={() => navigate("/shop")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
