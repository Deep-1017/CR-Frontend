import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PaymentFlowErrorBoundaryProps {
  children: ReactNode;
}

interface PaymentFlowErrorBoundaryState {
  hasError: boolean;
}

const reportPaymentBoundaryError = (error: Error, errorInfo: ErrorInfo): void => {
  console.error("[PaymentFlowBoundary] Unhandled error", error, errorInfo);

  const sentryCaptureException = (
    globalThis as typeof globalThis & {
      Sentry?: { captureException?: (exception: unknown, hint?: { tags?: Record<string, string> }) => void };
    }
  ).Sentry?.captureException;

  if (typeof sentryCaptureException === "function") {
    sentryCaptureException(error, {
      tags: { context: "payment-flow", step: "error-boundary" },
    });
  }
};

class PaymentFlowErrorBoundary extends Component<
  PaymentFlowErrorBoundaryProps,
  PaymentFlowErrorBoundaryState
> {
  public state: PaymentFlowErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): PaymentFlowErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportPaymentBoundaryError(error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 text-center space-y-3">
            <h2 className="text-xl font-semibold">Checkout encountered an error</h2>
            <p className="text-sm text-muted-foreground">
              We hit an unexpected issue while processing payment. Please refresh and try again.
            </p>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Reload Checkout
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentFlowErrorBoundary;
