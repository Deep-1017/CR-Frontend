import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  productId?: string;
  variantId?: string;
  configuration?: string;
  finish?: string;
  sku?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "cart";

interface CartApiProduct {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  basePrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  variants?: Array<{
    variantId?: string;
    _id?: string;
    configuration?: string;
    finish?: string;
    sku?: string;
    price?: number;
    images?: string[];
  }>;
}

interface CartApiItem {
  product?: CartApiProduct;
  variantKey?: string;
  quantity?: number;
}

interface CartResponse {
  success?: boolean;
  cart?: {
    items?: CartApiItem[];
  };
}

const readLocalCart = (): CartItem[] => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toUniqueItems = (items: CartItem[]): CartItem[] => {
  const uniqueMap = new Map<string, CartItem>();
  for (const item of items) {
    if (!item?.id) continue;
    uniqueMap.set(item.id, item);
  }
  return Array.from(uniqueMap.values());
};

const buildCartItemId = (productId: string, variantId?: string) =>
  variantId ? `${productId}:${variantId}` : productId;

const toCartItem = (apiItem: CartApiItem): CartItem | null => {
  const product = apiItem.product;
  const productId = product?.id ?? product?._id;
  if (!productId || !product?.name) return null;

  const variantKey = (apiItem.variantKey ?? "").trim();
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const matchedVariant =
    variantKey.length > 0
      ? variants.find((variant) => {
          const id = variant.variantId ?? variant._id;
          return id === variantKey || variant.sku === variantKey;
        })
      : undefined;

  const image =
    matchedVariant?.images?.[0] ??
    product.image ??
    product.images?.[0] ??
    "/placeholder.svg";

  const price = Number(matchedVariant?.price ?? product.price ?? product.basePrice ?? 0);
  const quantity = Math.max(1, Number(apiItem.quantity ?? 1));

  return {
    id: buildCartItemId(productId, variantKey || undefined),
    productId,
    variantId: variantKey || undefined,
    configuration: matchedVariant?.configuration,
    finish: matchedVariant?.finish,
    sku: matchedVariant?.sku,
    name: product.name,
    price,
    image,
    quantity,
    category: product.category ?? "Products",
  };
};

const getProductAndVariantFromCartId = (id: string): { productId: string; variantKey: string } => {
  const [productId, variantKey] = id.split(":");
  return { productId, variantKey: variantKey ?? "" };
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hasHydratedRef = useRef(false);
  const previousAuthRef = useRef(false);
  const isAuthed = useMemo(
    () => isAuthenticated || Boolean(localStorage.getItem("access_token")),
    [isAuthenticated]
  );

  useEffect(() => {
    if (isLoading) return;

    const hydrate = async () => {
      if (!isAuthed) {
        setItems(readLocalCart());
        previousAuthRef.current = false;
        hasHydratedRef.current = true;
        return;
      }

      const localItems = readLocalCart();
      const justLoggedIn = !previousAuthRef.current;
      previousAuthRef.current = true;

      if (justLoggedIn && localItems.length > 0) {
        await Promise.all(
          localItems.map((item) => {
            const productId = item.productId ?? getProductAndVariantFromCartId(item.id).productId;
            const variantKey = item.variantId ?? getProductAndVariantFromCartId(item.id).variantKey;
            return api
              .post("/cart", { productId, variantKey, quantity: item.quantity })
              .catch(() => null);
          })
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      const { data } = await api.get<CartResponse>("/cart");
      const mappedItems = toUniqueItems(
        (data?.cart?.items ?? [])
          .map(toCartItem)
          .filter((item): item is CartItem => Boolean(item))
      );
      setItems(mappedItems);
      hasHydratedRef.current = true;
    };

    hydrate().catch(() => {
      if (!hasHydratedRef.current) {
        setItems(readLocalCart());
        hasHydratedRef.current = true;
      }
    });
  }, [isAuthed, isLoading]);

  useEffect(() => {
    if (!hasHydratedRef.current || isAuthed) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items, isAuthed]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    const productId = item.productId ?? getProductAndVariantFromCartId(item.id).productId;
    const variantKey = item.variantId ?? getProductAndVariantFromCartId(item.id).variantKey;

    if (isAuthed) {
      const existingQty = items.find((i) => i.id === item.id)?.quantity ?? 0;
      const nextQuantity = existingQty + 1;

      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          toast({ title: "Updated cart", description: `${item.name} quantity increased` });
          return prev.map((i) => (i.id === item.id ? { ...i, quantity: nextQuantity } : i));
        }
        toast({ title: "Added to cart", description: `${item.name} added to your cart` });
        return [...prev, { ...item, quantity: 1 }];
      });

      api
        .post("/cart", { productId, variantKey, quantity: nextQuantity })
        .then((res) => {
          const data = res.data as CartResponse;
          const mappedItems = toUniqueItems(
            (data?.cart?.items ?? [])
              .map(toCartItem)
              .filter((mapped): mapped is CartItem => Boolean(mapped))
          );
          if (mappedItems.length > 0) setItems(mappedItems);
        })
        .catch(() => null);

      setIsCartOpen(true);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast({ title: "Updated cart", description: `${item.name} quantity increased` });
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      toast({ title: "Added to cart", description: `${item.name} added to your cart` });
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    const { productId, variantKey } = getProductAndVariantFromCartId(id);

    if (isAuthed) {
      api
        .delete(`/cart/${productId}`, { params: { variantKey } })
        .catch(() => null);
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Removed from cart" });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    const { productId, variantKey } = getProductAndVariantFromCartId(id);

    if (isAuthed) {
      api
        .post("/cart", { productId, variantKey, quantity })
        .catch(() => null);
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    if (isAuthed) {
      api.delete("/cart").catch(() => null);
    }
    setItems([]);
    toast({ title: "Cart cleared" });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
