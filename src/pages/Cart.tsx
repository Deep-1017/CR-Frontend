import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ShoppingBag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CartItem from "@/components/CartItem";
import { useCart, type CartItem as CartItemData } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getProductById } from "@/lib/api";
import { cn, formatINR } from "@/lib/utils";

interface ProductVariantSnapshot {
  variantId?: string;
  _id?: string;
  configuration: string;
  finish: string;
  stock: number;
  sku: string;
  price?: number;
  images?: string[];
}

interface ProductSnapshot {
  id: string;
  name: string;
  category: string;
  image: string;
  variants: ProductVariantSnapshot[];
}

interface CartStockLookup {
  product: ProductSnapshot | null;
}

interface ResolvedCartItem {
  cartItem: CartItemData;
  product: ProductSnapshot | null;
  matchedVariant: ProductVariantSnapshot | null;
  resolvedImage: string;
  maxStock: number | null;
  stockLabel?: string;
  stockTone: "success" | "warning" | "danger" | "muted";
  isUnavailable: boolean;
  isMalformed: boolean;
  quantityExceedsStock: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const readNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const readStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []))
    : [];

const normalizeVariant = (value: unknown): ProductVariantSnapshot | null => {
  if (!isRecord(value)) {
    return null;
  }

  const configuration = readString(value.configuration);
  const finish = readString(value.finish);
  const sku = readString(value.sku);
  const stock = readNumber(value.stock) ?? 0;

  if (!configuration || !finish || !sku) {
    return null;
  }

  const normalized: ProductVariantSnapshot = {
    configuration,
    finish,
    stock: Math.max(0, stock),
    sku,
  };

  const variantId = readString(value.variantId) ?? readString(value._id);
  const price = readNumber(value.price);
  const images = readStringArray(value.images);

  if (variantId) {
    normalized.variantId = variantId;
  }

  if (price !== undefined) {
    normalized.price = price;
  }

  if (images.length > 0) {
    normalized.images = images;
  }

  return normalized;
};

const normalizeProductSnapshot = (raw: unknown, fallbackId: string): ProductSnapshot | null => {
  const source = isRecord(raw) && isRecord(raw.product) ? raw.product : raw;
  if (!isRecord(source)) {
    return null;
  }

  const variantEntries = Array.isArray(source.variants) ? source.variants : [];
  const variants = variantEntries
    .map((variant) => normalizeVariant(variant))
    .filter((variant): variant is ProductVariantSnapshot => Boolean(variant));

  return {
    id: readString(source.id) ?? readString(source._id) ?? fallbackId,
    name: readString(source.name) ?? "Unnamed product",
    category: readString(source.category) ?? "Instruments",
    image: readStringArray(source.images)[0] ?? readString(source.image) ?? "/placeholder.svg",
    variants,
  };
};

const getVariantKey = (variant: ProductVariantSnapshot): string =>
  [variant.variantId, variant._id, variant.sku, variant.configuration, variant.finish]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join("|");

const getItemVariantKey = (item: CartItemData): string =>
  [item.variantId, item.sku, item.configuration, item.finish]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join("|");

const getStockLabel = (stock: number): { label: string; tone: ResolvedCartItem["stockTone"] } => {
  if (stock >= 5) {
    return { label: "In Stock", tone: "success" };
  }

  if (stock > 0) {
    return { label: `Only ${stock} left`, tone: "warning" };
  }

  return { label: "Out of Stock", tone: "danger" };
};

const isOversizedItem = (item: CartItemData): boolean => {
  const haystack = `${item.category} ${item.name}`.toLowerCase();
  return ["drum", "piano", "keyboard", "speaker", "bass"].some((keyword) => haystack.includes(keyword));
};

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart } = useCart();
  const { addToWishlist } = useWishlist();

  const uniqueProductIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.productId).filter((value): value is string => Boolean(value)))),
    [items]
  );

  const stockQuery = useQuery<Record<string, CartStockLookup>>({
    queryKey: ["cart-stock", uniqueProductIds.join("|")],
    enabled: uniqueProductIds.length > 0,
    queryFn: async () => {
      const resolvedEntries = await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const rawProduct = await getProductById(productId);
            const product = normalizeProductSnapshot(rawProduct, productId);
            return [productId, { product }] as const;
          } catch {
            return [productId, { product: null }] as const;
          }
        })
      );

      return Object.fromEntries(resolvedEntries);
    },
    retry: false,
  });

  const resolvedItems = useMemo<ResolvedCartItem[]>(() => {
    return items.map((cartItem) => {
      const product = cartItem.productId ? stockQuery.data?.[cartItem.productId]?.product ?? null : null;
      const itemVariantKey = getItemVariantKey(cartItem);

      const matchedVariant =
        product?.variants.find((variant) => {
          const candidateKey = getVariantKey(variant);
          return Boolean(candidateKey) && candidateKey === itemVariantKey;
        }) ?? null;

      const effectiveVariant = matchedVariant ?? product?.variants.find((variant) => {
        if (cartItem.variantId && variant.variantId && variant.variantId === cartItem.variantId) {
          return true;
        }

        if (cartItem.sku && variant.sku === cartItem.sku) {
          return true;
        }

        return false;
      }) ?? null;

      const maxStock = effectiveVariant?.stock ?? null;
      const stockInfo = maxStock !== null ? getStockLabel(maxStock) : undefined;
      const isMalformed =
        !cartItem.productId ||
        !cartItem.variantId ||
        !cartItem.configuration ||
        !cartItem.finish ||
        !cartItem.sku;
      const isUnavailable =
        isMalformed ||
        product === null ||
        effectiveVariant === null ||
        maxStock === 0;
      const quantityExceedsStock = maxStock !== null && maxStock > 0 && cartItem.quantity > maxStock;
      const stockLabel =
        maxStock === null
          ? "Stock unavailable"
          : stockInfo?.label ?? "Stock unavailable";
      const stockTone =
        maxStock === null
          ? "muted"
          : stockInfo?.tone ?? "muted";

      return {
        cartItem: {
          ...cartItem,
          image: effectiveVariant?.images?.[0] ?? product?.image ?? cartItem.image,
        },
        product,
        matchedVariant: effectiveVariant,
        resolvedImage: effectiveVariant?.images?.[0] ?? product?.image ?? cartItem.image,
        maxStock,
        stockLabel,
        stockTone,
        isUnavailable,
        isMalformed,
        quantityExceedsStock,
      };
    });
  }, [items, stockQuery.data]);

  const subtotal = useMemo(
    () => resolvedItems.reduce((sum, item) => sum + item.cartItem.price * item.cartItem.quantity, 0),
    [resolvedItems]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const hasBlockingIssues = resolvedItems.some(
    (item) => item.isUnavailable || item.isMalformed || item.quantityExceedsStock
  );
  const estimatedShipping = useMemo(
    () => (items.some(isOversizedItem) ? 1499 : 0),
    [items]
  );
  const grandTotal = subtotal + estimatedShipping;

  const handleSaveToWishlist = (entry: ResolvedCartItem) => {
    addToWishlist({
      id: entry.cartItem.productId ?? entry.cartItem.id,
      name: [entry.cartItem.name, entry.cartItem.configuration, entry.cartItem.finish]
        .filter(Boolean)
        .join(" - "),
      price: entry.cartItem.price,
      image: entry.resolvedImage,
      category: entry.product?.category ?? entry.cartItem.category,
      originalPrice: entry.product?.variants.find((variant) => variant.price)?.price,
    });
    removeFromCart(entry.cartItem.id);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-3 text-3xl font-bold text-foreground">Your cart is empty</h1>
            <p className="mb-8 text-muted-foreground">
              Add an instrument variant from the product page to start building your order.
            </p>
            <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cart</p>
            <h1 className="text-3xl font-bold text-foreground">Your shopping cart</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {stockQuery.isLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Checking stock</AlertTitle>
                <AlertDescription>
                  We’re verifying each variant against current inventory before checkout.
                </AlertDescription>
              </Alert>
            )}

            {resolvedItems.map((entry) => (
              <CartItem
                key={entry.cartItem.id}
                cartItem={entry.cartItem}
                maxStock={entry.maxStock}
                stockLabel={entry.stockLabel}
                stockTone={entry.stockTone}
                isUnavailable={entry.isUnavailable}
                onIncrement={() => updateQuantity(entry.cartItem.id, entry.cartItem.quantity + 1)}
                onDecrement={() => updateQuantity(entry.cartItem.id, entry.cartItem.quantity - 1)}
                onRemove={() => removeFromCart(entry.cartItem.id)}
                onSaveToWishlist={
                  entry.isUnavailable
                    ? () => handleSaveToWishlist(entry)
                    : undefined
                }
              />
            ))}

            {hasBlockingIssues && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Some cart items need attention</AlertTitle>
                <AlertDescription>
                  Review unavailable variants or reduce quantities before checkout.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Card className="sticky top-4 h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated shipping</span>
                <span className="font-medium">
                  {estimatedShipping === 0 ? "Free" : formatINR(estimatedShipping)}
                </span>
              </div>
              {items.some(isOversizedItem) && (
                <p className="text-xs text-muted-foreground">
                  Large or heavy instruments may require additional handling at checkout.
                </p>
              )}
              <div className="border-t border-border pt-4">
                <div className="mb-4 flex items-center justify-between text-base font-semibold">
                  <span>Grand total</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={hasBlockingIssues}
                >
                  {hasBlockingIssues ? "Resolve Cart Issues" : "Proceed to Checkout"}
                </Button>
                <p className={cn("mt-3 text-xs", hasBlockingIssues ? "text-red-600" : "text-muted-foreground")}>
                  {hasBlockingIssues
                    ? "Please fix unavailable variants or stock conflicts before continuing."
                    : "You can review your order details before payment."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
