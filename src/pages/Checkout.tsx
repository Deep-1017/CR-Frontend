import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { AlertCircle, LogIn, ShieldCheck, UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useOrder } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
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

// ─── Guest gate: shown when user is not authenticated ─────────────────────────

const GuestGate = ({
  onContinueAsGuest,
}: {
  onContinueAsGuest: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-lg border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-2xl font-bold text-stone-900">
          How would you like to proceed?
        </CardTitle>
        <p className="mt-1 text-sm text-stone-500">
          Sign in for a faster checkout, or continue as a guest.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Button
          id="checkout-login-btn"
          className="h-14 w-full gap-3 rounded-xl bg-stone-900 text-base font-semibold text-white hover:bg-stone-800"
          onClick={() => navigate("/login?redirect=/checkout")}
        >
          <LogIn className="h-5 w-5" />
          Login / Create Account
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-400">or</span>
          </div>
        </div>

        <Button
          id="checkout-guest-btn"
          variant="outline"
          className="h-14 w-full gap-3 rounded-xl border-2 border-stone-300 text-base font-semibold text-stone-700 hover:border-stone-400 hover:bg-stone-50"
          onClick={onContinueAsGuest}
        >
          <UserRound className="h-5 w-5" />
          Continue as Guest
        </Button>

        <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-xs text-stone-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span>Your information is secure. Guest checkout requires only email and shipping details — no password needed.</span>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main checkout content ────────────────────────────────────────────────────

const CheckoutContent = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { setConfirmedOrderId } = useOrder();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const addressQuery = useAddresses(isAuthenticated);
  const addresses = addressQuery.data;
  const paymentFinalizedRef = useRef(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [guestMode, setGuestMode] = useState(false);
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

  // Determine if user sees the guest gate
  const showGuestGate = !authLoading && !isAuthenticated && !guestMode;

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

    // For authenticated users, check token as before
    if (!isAuthenticated && !guestMode) {
      toast({
        title: "Sign in required",
        description: "Please login first or continue as guest.",
        variant: "destructive",
      });
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

    // Validate email format for guests
    if (guestMode && !isAuthenticated) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
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
            const isGuest = guestMode && !isAuthenticated;

            paymentFinalizedRef.current = true;
            setConfirmedOrderId(orderId);
            saveLastOrderSnapshot({
              orderId,
              email: customer.email,
              placedAt: new Date().toISOString(),
              pricing,
              isGuest,
            });
            clearCart();

            // For guests, include email in query so confirmation page can fetch the order
            const confirmUrl = isGuest
              ? `/order-confirmation/${orderId}?new=true&guest=true&email=${encodeURIComponent(customer.email)}`
              : `/order-confirmation/${orderId}?new=true`;

            navigate(confirmUrl, { replace: true });
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

  // Show loading state while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
            <span className="text-sm text-stone-500">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show guest gate if not authenticated and not in guest mode
  if (showGuestGate) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
          <GuestGate onContinueAsGuest={() => setGuestMode(true)} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* Guest checkout banner */}
        {guestMode && !isAuthenticated && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <UserRound className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Checking out as Guest</AlertTitle>
            <AlertDescription className="text-blue-700">
              No account needed. We'll send your order confirmation to the email below.{" "}
              <button
                type="button"
                className="font-medium underline hover:text-blue-900"
                onClick={() => navigate("/login?redirect=/checkout")}
              >
                Sign in instead
              </button>
            </AlertDescription>
          </Alert>
        )}

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
                  {/* Saved addresses — only for authenticated users */}
                  {isAuthenticated && sortedAddresses.length > 0 && (
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
                        placeholder={guestMode && !isAuthenticated ? "We'll send confirmation here" : ""}
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
