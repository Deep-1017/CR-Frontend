import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";
import { type CartItem as CartItemData } from "@/contexts/CartContext";

interface CartItemProps {
  cartItem: CartItemData;
  maxStock?: number | null;
  stockLabel?: string;
  stockTone?: "success" | "warning" | "danger" | "muted";
  isUnavailable?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onSaveToWishlist?: () => void;
}

const toneClasses: Record<NonNullable<CartItemProps["stockTone"]>, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-orange-200 bg-orange-50 text-orange-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  muted: "border-gray-200 bg-gray-50 text-gray-600",
};

const CartItem = ({
  cartItem,
  maxStock,
  stockLabel,
  stockTone = "muted",
  isUnavailable = false,
  onIncrement,
  onDecrement,
  onRemove,
  onSaveToWishlist,
}: CartItemProps) => {
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    if (maxStock === undefined || maxStock === null) {
      setStockError(null);
      return;
    }

    if (maxStock === 0) {
      setStockError("This variant is currently out of stock.");
      return;
    }

    if (cartItem.quantity > maxStock) {
      setStockError(`Only ${maxStock} left in stock. Reduce the quantity to continue.`);
      return;
    }

    setStockError(null);
  }, [cartItem.quantity, maxStock]);

  const handleIncrement = () => {
    if (maxStock !== undefined && maxStock !== null && cartItem.quantity >= maxStock) {
      setStockError(
        maxStock === 0
          ? "This variant is currently out of stock."
          : `Only ${maxStock} left in stock. Reduce the quantity to continue.`
      );
      return;
    }

    setStockError(null);
    onIncrement();
  };

  const handleDecrement = () => {
    setStockError(null);
    onDecrement();
  };

  const titleParts = [cartItem.name, cartItem.configuration, cartItem.finish].filter(Boolean);
  const details = [cartItem.configuration && `Config: ${cartItem.configuration}`, cartItem.finish && `Finish: ${cartItem.finish}`]
    .filter(Boolean)
    .join(" | ");
  const lineSubtotal = cartItem.price * cartItem.quantity;
  const atLimit = maxStock !== undefined && maxStock !== null && cartItem.quantity >= maxStock;
  const showStockBadge = Boolean(stockLabel);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-colors",
        isUnavailable ? "border-red-200 bg-red-50/60" : "border-border bg-background"
      )}
    >
      <div className="flex gap-4">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
          <img
            src={cartItem.image}
            alt={titleParts.join(" - ")}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-foreground">
                {titleParts.join(" - ")}
              </h3>
              {details && <p className="mt-1 text-sm text-muted-foreground">{details}</p>}
              {cartItem.sku && (
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  SKU: {cartItem.sku}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={onRemove}
                aria-label={`Remove ${cartItem.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Unit price: {formatINR(cartItem.price)}
            </span>
            {showStockBadge && (
              <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", toneClasses[stockTone])}>
                {stockLabel}
              </span>
            )}
            {isUnavailable && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Unavailable
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center overflow-hidden rounded-full border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  onClick={handleDecrement}
                  disabled={cartItem.quantity <= 1}
                  aria-label={`Decrease quantity for ${cartItem.name}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-10 px-3 text-center text-sm font-semibold">
                  {cartItem.quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  onClick={handleIncrement}
                  disabled={atLimit || isUnavailable}
                  aria-label={`Increase quantity for ${cartItem.name}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Line subtotal: {formatINR(lineSubtotal)}
              </p>
            </div>

            {onSaveToWishlist && isUnavailable && (
              <Button type="button" variant="outline" onClick={onSaveToWishlist}>
                <Heart className="mr-2 h-4 w-4" />
                Save to Wishlist
              </Button>
            )}
          </div>

          {stockError && (
            <p className="mt-3 text-sm text-red-600">
              {stockError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
