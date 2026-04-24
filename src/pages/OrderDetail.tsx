import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  ExternalLink,
  Headphones,
  MapPin,
  Printer,
  RefreshCw,
  RotateCcw,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrderTimeline from "@/components/OrderTimeline";
import OrderItemsTable from "@/components/OrderItemsTable";
import OrderDetailSkeleton from "@/components/OrderDetailSkeleton";
import { useOrderDetail, type DetailOrderStatus } from "@/hooks/useOrderDetail";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  Pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  Processing: {
    label: "Shipped",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-400",
  },
  Shipped: {
    label: "Shipped",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-400",
  },
  Confirmed: {
    label: "Confirmed",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-400",
  },
  Completed: {
    label: "Delivered",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-400",
  },
  Delivered: {
    label: "Delivered",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-400",
  },
  Cancelled: {
    label: "Cancelled",
    className: "border-stone-200 bg-stone-100 text-stone-500",
    dot: "bg-stone-400",
  },
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "Not available";

  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const isShippedStatus = (status: DetailOrderStatus) =>
  ["Processing", "Shipped", "Completed", "Delivered"].includes(status);

const canCancelStatus = (status: DetailOrderStatus) =>
  ["Confirmed", "Processing", "Shipped"].includes(status);

const canChangeAddressStatus = (status: DetailOrderStatus) =>
  ["Pending", "Confirmed"].includes(status);

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrderDetail(orderId);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/orders/${orderId ?? ""}`)}`);
    }
  }, [isAuthLoading, isAuthenticated, navigate, orderId]);

  const responseStatus = (error as any)?.response?.status;
  const isAuthError = responseStatus === 401 || responseStatus === 403;
  const isNotFound = responseStatus === 404;

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    toast({
      title: "PDF download is coming soon",
      description: "Use Print for now to save this order as a PDF.",
    });
  };

  const handleReorder = () => {
    if (!order) return;

    order.items.forEach((item) => {
      const cartItem = {
        id: item.variantId ?? item.productId ?? `${order._id}-${item.productName}`,
        productId: item.productId,
        variantId: item.variantId,
        configuration: item.configuration,
        finish: item.finish,
        sku: item.sku,
        name: item.productName,
        price: item.priceAtPurchase || item.price,
        image: item.image,
        category: "Reorder",
      };

      Array.from({ length: Math.max(item.quantity, 1) }).forEach(() => {
        addToCart(cartItem);
      });
    });

    setIsCartOpen(true);
  };

  const status = order
    ? STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.Pending
    : STATUS_CONFIG.Pending;

  return (
    <div className="min-h-screen bg-[#FAFAF8] print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 md:px-8 md:py-10 print:px-0 print:py-0">
        <div className="mx-auto max-w-5xl space-y-6">
          <button
            onClick={() => navigate("/account/orders")}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>

          {(isLoading || isAuthLoading) && <OrderDetailSkeleton />}

          {isAuthError && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
              <p className="text-base font-semibold text-red-900">
                Please log in again
              </p>
              <p className="mt-1 text-sm text-red-700">
                Your session expired or this order is not available for this account.
              </p>
              <Button
                className="mt-5 rounded-full bg-red-600 text-white hover:bg-red-700"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </section>
          )}

          {isNotFound && (
            <section className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-stone-400" />
              <p className="text-base font-semibold text-stone-900">
                Order not found
              </p>
              <p className="mt-1 text-sm text-stone-500">
                This order does not exist, or it may belong to another account.
              </p>
              <Button
                className="mt-5 rounded-full bg-stone-900 text-white hover:bg-stone-800"
                onClick={() => navigate("/account/orders")}
              >
                View All Orders
              </Button>
            </section>
          )}

          {isError && !isAuthError && !isNotFound && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">
                    Could not load order details
                  </p>
                  <p className="mt-1 text-xs text-red-700">
                    {(error as any)?.response?.data?.message ??
                      "Please check your connection and try again."}
                  </p>
                </div>
              </div>
              <Button
                className="mt-4 rounded-full bg-stone-900 text-white hover:bg-stone-800"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Retry
              </Button>
            </section>
          )}

          {!isLoading && !isError && order && (
            <>
              <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_18px_50px_rgba(28,25,23,0.06)] print:break-inside-avoid print:shadow-none md:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                      Order Details
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
                        {order.orderNumber}
                      </h1>
                      <Badge
                        variant="outline"
                        className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 ${status.className}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-stone-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 print:hidden">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-stone-200"
                      onClick={handlePrint}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-stone-200"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </section>

              <OrderTimeline order={order} />
              <OrderItemsTable order={order} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:break-inside-avoid md:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        Shipping Address
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Where this order is headed.
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-stone-400" />
                  </div>

                  <div className="space-y-2 text-sm text-stone-600">
                    <p className="font-semibold text-stone-900">
                      {[order.customer?.firstName, order.customer?.lastName]
                        .filter(Boolean)
                        .join(" ") || "Customer"}
                    </p>
                    {order.customer?.phone && <p>{order.customer.phone}</p>}
                    {order.customer?.address && <p>{order.customer.address}</p>}
                    <p>
                      {[order.customer?.city, order.customer?.state, order.customer?.zipCode]
                        .filter(Boolean)
                        .join(", ") || "Address not available"}
                    </p>
                  </div>

                  {canChangeAddressStatus(order.orderStatus) && (
                    <Button
                      variant="outline"
                      className="mt-5 rounded-full border-stone-300 print:hidden"
                      onClick={() =>
                        toast({
                          title: "Address changes are coming soon",
                          description:
                            "Please contact support if this order needs an urgent update.",
                        })
                      }
                    >
                      Change address
                    </Button>
                  )}
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:break-inside-avoid md:p-6">
                  <p className="mb-4 text-sm font-semibold text-stone-900">
                    Payment Information
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-stone-600">Payment method</span>
                      <span className="font-medium capitalize text-stone-900">
                        {order.paymentDetails?.provider ??
                          order.paymentMethod ??
                          "Razorpay"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-600">Transaction ID</span>
                      {order.transactionId || order.paymentId ? (
                        <button
                          className="inline-flex max-w-[220px] items-center gap-1 break-all text-right font-mono text-xs text-stone-700 underline-offset-4 hover:underline"
                          onClick={() =>
                            toast({
                              title: "Dashboard verification is a future enhancement",
                              description:
                                "The transaction reference is shown here for support checks.",
                            })
                          }
                        >
                          {order.transactionId ?? order.paymentId}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </button>
                      ) : (
                        <span className="text-stone-400">Not available</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                      <span className="text-stone-600">Amount paid</span>
                      <span className="font-semibold text-stone-900">
                        {formatAmount(order.amountPaid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Payment status</span>
                      <Badge
                        variant="outline"
                        className={`rounded-full text-xs ${
                          order.paymentStatus === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : order.paymentStatus === "pending"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {order.paymentStatus === "success"
                          ? "Successful"
                          : order.paymentStatus === "pending"
                            ? "Pending"
                            : "Failed"}
                      </Badge>
                    </div>
                  </div>
                </section>
              </div>

              {isShippedStatus(order.orderStatus) && (
                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:break-inside-avoid md:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        Tracking Information
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Carrier updates will appear here when available.
                      </p>
                    </div>
                    <Truck className="h-5 w-5 text-stone-400" />
                  </div>

                  <div className="grid gap-4 text-sm md:grid-cols-4">
                    <InfoBlock
                      label="Carrier"
                      value={
                        order.tracking?.carrierName ??
                        order.tracking?.carrier ??
                        "Delhivery"
                      }
                    />
                    <InfoBlock
                      label="Tracking number"
                      value={order.tracking?.trackingNumber ?? "Pending"}
                    />
                    <InfoBlock
                      label="Estimated delivery"
                      value={formatDate(
                        order.tracking?.estimatedDeliveryDate ??
                          order.estimatedDeliveryDate,
                      )}
                    />
                    <InfoBlock
                      label="Current location"
                      value={order.tracking?.currentLocation ?? "Not available"}
                    />
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:hidden md:p-6">
                <p className="mb-4 text-sm font-semibold text-stone-900">
                  Order Actions
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {canCancelStatus(order.orderStatus) && (
                    <Button
                      variant="outline"
                      className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() =>
                        toast({
                          title: "Cancel order flow is coming soon",
                          description:
                            "This will connect to the cancellation task when it is ready.",
                        })
                      }
                    >
                      Cancel Order
                    </Button>
                  )}
                  <Button
                    className="rounded-full bg-stone-900 text-white hover:bg-stone-800"
                    onClick={handleReorder}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reorder
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-stone-300 text-stone-600 hover:bg-stone-50"
                    onClick={() =>
                      toast({
                        title: "Return and exchange is coming soon",
                        description:
                          "Eligibility rules will appear here after fulfillment is complete.",
                      })
                    }
                  >
                    Return/Exchange
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-stone-300 text-stone-600 hover:bg-stone-50"
                  >
                    <Link to="/account">
                      <Headphones className="mr-2 h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

interface InfoBlockProps {
  label: string;
  value: string;
}

const InfoBlock = ({ label, value }: InfoBlockProps) => (
  <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
    <p className="text-xs uppercase tracking-[0.16em] text-stone-400">{label}</p>
    <p className="mt-2 break-words text-sm font-semibold text-stone-900">
      {value}
    </p>
  </div>
);

export default OrderDetail;
