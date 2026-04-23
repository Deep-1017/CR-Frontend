import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/api";

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-sdk";

export interface PaymentCartItem {
  productId: string;
  variantId: string;
  configuration: string;
  finish: string;
  quantity: number;
  price: number;
}

export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
}

export interface CheckoutPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface CreatePaymentOrderPayload {
  customer: CheckoutCustomer;
  cartItems: PaymentCartItem[];
  pricing: CheckoutPricing;
  currency?: "INR";
}

export interface CreatePaymentOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  message: string;
  orderId?: string;
}

interface ResendConfirmationResponse {
  message: string;
  confirmationEmailSentAt?: string;
}

interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: RazorpayPrefill;
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (eventName: "payment.failed", callback: (response: { error: RazorpayErrorResponse }) => void) => void;
}

type UserProfileLike = {
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  contact?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiMessage =
      (error.response?.data as { message?: string } | undefined)?.message ??
      (error.response?.data as { error?: string } | undefined)?.error;

    if (apiMessage) return apiMessage;
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (error.response?.status === 401) return "Please log in to continue with payment.";
    if (error.response?.status === 400) return "Invalid payment data. Please review your cart.";
    if (error.response?.status && error.response.status >= 500) {
      return "Payment service is temporarily unavailable. Please try again shortly.";
    }

    return "Unable to create payment order right now. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong while processing your payment.";
};

const parseProfileRecord = (value: string | null): UserProfileLike | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as UserProfileLike;
    }
  } catch {
    return null;
  }

  return null;
};

const getUserProfilePrefill = (): RazorpayPrefill => {
  if (typeof window === "undefined") return {};

  const candidateKeys = ["userProfile", "user", "authUser"];
  for (const key of candidateKeys) {
    const profile = parseProfileRecord(window.localStorage.getItem(key));
    if (!profile) continue;

    const name = profile.name ?? profile.fullName;
    const email = profile.email;
    const contact = profile.phone ?? profile.contact;

    if (name || email || contact) {
      return { name, email, contact };
    }
  }

  return {};
};

const loadRazorpayScript = async (): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Payment checkout is only available in the browser.");
  }

  if (window.Razorpay) return;
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load payment SDK. Please check your connection.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load payment SDK. Please check your connection."));
    document.body.appendChild(script);
  })
    .then(() => {
      if (!window.Razorpay) {
        throw new Error("Payment SDK loaded but Razorpay was not initialized.");
      }
    })
    .catch((error) => {
      razorpayScriptPromise = null;
      throw error;
    });

  return razorpayScriptPromise;
};

export const createPaymentOrder = async (
  customer: CheckoutCustomer,
  cartItems: PaymentCartItem[],
  pricing: CheckoutPricing
): Promise<CreatePaymentOrderResponse> => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Your cart is empty. Add items before checkout.");
  }

  if (!Number.isFinite(pricing.total) || pricing.total <= 0) {
    throw new Error("Invalid payment amount. Please refresh and try again.");
  }

  try {
    const payload: CreatePaymentOrderPayload = {
      customer,
      cartItems,
      pricing,
      currency: "INR",
    };

    const response = await api.post<CreatePaymentOrderResponse>("/payments/create-order", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const initiateRazorpayPayment = async (
  orderData: CreatePaymentOrderResponse,
  onSuccess: (response: RazorpaySuccessResponse) => void,
  onFailure?: (error?: RazorpayErrorResponse) => void,
  onDismiss?: () => void
): Promise<void> => {
  if (!orderData?.key || !orderData?.razorpayOrderId || !orderData?.amount || !orderData?.currency) {
    throw new Error("Payment session is invalid. Please retry checkout.");
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Payment service is not available right now. Please try again.");
  }

  const options: RazorpayOptions = {
    key: orderData.key,
    amount: orderData.amount,
    currency: orderData.currency,
    order_id: orderData.razorpayOrderId,
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
    prefill: getUserProfilePrefill(),
    theme: { color: "#2563eb" },
  };

  const razorpay = new window.Razorpay(options);
  if (onFailure) {
    razorpay.on("payment.failed", (response) => {
      onFailure(response.error);
    });
  }
  razorpay.open();
};

export const verifyPaymentWebhook = async (
  payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> => {
  try {
    const response = await api.post<VerifyPaymentResponse>("/payments/verify-webhook", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resendOrderConfirmationEmail = async (
  orderId: string
): Promise<ResendConfirmationResponse> => {
  try {
    const response = await api.post<ResendConfirmationResponse>(
      `/payments/${orderId}/resend-confirmation`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const useCreatePayment = () => {
  const mutation = useMutation<CreatePaymentOrderResponse, Error, CreatePaymentOrderPayload>({
    mutationFn: ({ customer, cartItems, pricing }) => createPaymentOrder(customer, cartItems, pricing),
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    mutateAsync: mutation.mutateAsync,
  };
};
