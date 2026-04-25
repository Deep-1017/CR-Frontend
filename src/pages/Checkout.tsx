import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useOrder } from "@/contexts/OrderContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatINR } from "@/lib/utils";
import { saveLastOrderSnapshot } from "@/lib/lastOrder";
import { toast } from "@/hooks/use-toast";
import { useAddresses } from "@/hooks/useAddresses";
import type { Address } from "@/services/addressService";
import {
  createPaymentOrder,
  initiateRazorpayPayment,
  verifyPaymentWebhook,
  type CheckoutCustomer,
  type CheckoutPricing,
  type RazorpaySuccessResponse,
} from "@/services/paymentService";
import PaymentFlowErrorBoundary from "@/components/payment/PaymentFlowErrorBoundary";

const logPaymentError = (error: unknown, context: string): void => {
  console.error(`[PaymentFlow] ${context}`, error);

  const sentryCaptureException = (
    globalThis as typeof globalThis & {
      Sentry?: { captureException?: (exception: unknown, hint?: { tags?: Record<string, string> }) => void };
    }
  ).Sentry?.captureException;

  if (typeof sentryCaptureException === "function") {
    sentryCaptureException(error, { tags: { context: "payment-flow", step: context } });
  }
};

const getCheckoutErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      "Unable to process payment. Try again."
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to process payment. Try again.";
};

const getMissingFieldLabels = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}) => {
  const requiredFields: Array<{ key: keyof typeof formData; label: string }> = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "zipCode", label: "ZIP Code" },
  ];

  return requiredFields
    .filter(({ key }) => !formData[key].trim())
    .map(({ label }) => label);
};

const CheckoutContent = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { setConfirmedOrderId } = useOrder();
  const navigate = useNavigate();
  const { data: addresses } = useAddresses();
  const paymentFinalizedRef = useRef(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const sortedAddresses = useMemo(() => {
    if (!addresses) return [];
    return [...addresses].sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [addresses]);

  const selectedAddress: Address | undefined = useMemo(() => {
    if (!selectedAddressId) return undefined;
    return sortedAddresses.find((a) => a._id === selectedAddressId);
  }, [selectedAddressId, sortedAddresses]);

  const applyAddressToForm = (address: Address) => {
    const [firstName, ...rest] = address.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ");
    const line2 = address.addressLine2?.trim();
    const joinedAddress = [address.addressLine1, line2 ? line2 : null].filter(Boolean).join(", ");
    setFormData((prev) => ({
      ...prev,
      firstName: firstName ?? prev.firstName,
      lastName: lastName || prev.lastName,
      phone: address.phone ?? prev.phone,
      address: joinedAddress || prev.address,
      city: address.city ?? prev.city,
      state: address.state ?? prev.state,
      zipCode: address.zipCode ?? prev.zipCode,
    }));
  };

  useEffect(() => {
    if (!sortedAddresses.length) return;
    if (selectedAddressId) return;
    const defaultAddress = sortedAddresses.find((a) => a.isDefault) ?? sortedAddresses[0];
    if (!defaultAddress) return;
    setSelectedAddressId(defaultAddress._id);
    applyAddressToForm(defaultAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAddresses, selectedAddressId]);

  useEffect(() => {
    if (!selectedAddress) return;
    applyAddressToForm(selectedAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId]);
  const pricing: CheckoutPricing = {
    subtotal: Number(totalPrice.toFixed(2)),
    tax: Number((totalPrice * 0.1).toFixed(2)),
    shipping: 0,
    total: Number((totalPrice * 1.1).toFixed(2)),
  };
  const itemsMissingVariant = items.filter(
    (item) => !item.productId || !item.variantId || !item.configuration || !item.finish
  );
  const hasInvalidCartItems = itemsMissingVariant.length > 0;
  const resetInvalidCart = () => {
    clearCart();
    navigate("/shop");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingPayment) return;

    const authToken =
      window.localStorage.getItem("auth_token") ??
      window.localStorage.getItem("authToken") ??
      window.localStorage.getItem("token");
    if (!authToken) {
      toast({
        title: "Sign in required",
        description: "Please login first to continue with payment.",
        variant: "destructive",
      });
      navigate("/login?redirect=/checkout");
      return;
    }

    const missingFields = getMissingFieldLabels(formData);
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Some details are remaining to fill: ${missingFields.join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    if (hasInvalidCartItems) {
      toast({
        title: "Variant selection required",
        description: "Remove older cart items and add them again after choosing a finish and configuration.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      paymentFinalizedRef.current = false;
      const customer: CheckoutCustomer = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || undefined,
        zipCode: formData.zipCode.trim(),
      };
      const cartItems = items.map((item) => ({
        productId: item.productId as string,
        variantId: item.variantId as string,
        configuration: item.configuration as string,
        finish: item.finish as string,
        quantity: item.quantity,
        price: item.price,
      }));
      const paymentOrder = await createPaymentOrder(customer, cartItems, pricing);

      await initiateRazorpayPayment(
        paymentOrder,
        async (response: RazorpaySuccessResponse) => {
          try {
            const verificationResponse = await verifyPaymentWebhook({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const orderId = verificationResponse.orderId || paymentOrder.orderId;

            paymentFinalizedRef.current = true;
            setConfirmedOrderId(orderId);
            saveLastOrderSnapshot({
              orderId,
              email: customer.email,
              placedAt: new Date().toISOString(),
              pricing,
            });
            clearCart();
            navigate(`/order-confirmation/${orderId}?new=true`, {
              replace: true,
            });
          } catch (error) {
            logPaymentError(error, "verify-webhook");
            toast({
              title: "Payment verification failed",
              description: "Payment verification failed. Contact support.",
              variant: "destructive",
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        (error) => {
          logPaymentError(error, "razorpay-payment-failed");
          toast({
            title: "Unable to process payment",
            description: "Unable to process payment. Try again",
            variant: "destructive",
          });
          setIsProcessingPayment(false);
        },
        () => {
          if (paymentFinalizedRef.current) return;
          toast({
            title: "Payment cancelled",
            description: "Payment cancelled",
          });
          setIsProcessingPayment(false);
        }
      );
    } catch (error) {
      logPaymentError(error, "create-payment-order-or-init");
      toast({
        title: "Unable to process payment",
        description: getCheckoutErrorMessage(error),
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {hasInvalidCartItems && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Variant selection required</AlertTitle>
                  <AlertDescription>
                    <p>
                      {itemsMissingVariant.map((item) => item.name).join(", ")} must be added again from the product page after selecting a finish and configuration.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-200 bg-white text-red-700 hover:bg-red-50"
                      onClick={resetInvalidCart}
                    >
                      Clear cart and choose variants
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedAddresses.length > 0 && (
                    <div className="space-y-3 rounded-md border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">Saved addresses</p>
                          <p className="text-sm text-muted-foreground">
                            Choose an address to auto-fill shipping details.
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/account/addresses">Manage</Link>
                        </Button>
                      </div>

                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={(v) => setSelectedAddressId(v)}
                        className="grid gap-3"
                      >
                        {sortedAddresses.map((addr) => {
                          const line2 = addr.addressLine2?.trim();
                          const summary = [
                            addr.addressLine1,
                            line2 ? line2 : null,
                            `${addr.city}, ${addr.state} ${addr.zipCode}`,
                          ]
                            .filter(Boolean)
                            .join(", ");

                          return (
                            <label
                              key={addr._id}
                              className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/40"
                            >
                              <RadioGroupItem value={addr._id} className="mt-1" />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium truncate">{addr.label}</p>
                                  {addr.isDefault && (
                                    <span className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{addr.fullName}</p>
                                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
                              </div>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Name on Card *</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiry Date *</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv">CVV *</Label>
                      <Input
                        id="cardCvv"
                        name="cardCvv"
                        placeholder="123"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        {(item.configuration || item.finish) && (
                          <p className="text-xs text-muted-foreground">
                            {[item.finish, item.configuration].filter(Boolean).join(" / ")}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-semibold">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatINR(pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{pricing.shipping === 0 ? "Free" : formatINR(pricing.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatINR(pricing.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                      <span>Total</span>
                      <span>{formatINR(pricing.total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessingPayment || hasInvalidCartItems}
                  >
                    {hasInvalidCartItems
                      ? "Update Cart Items"
                      : isProcessingPayment
                        ? "Processing..."
                        : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

const Checkout = () => (
  <PaymentFlowErrorBoundary>
    <CheckoutContent />
  </PaymentFlowErrorBoundary>
);

export default Checkout;
