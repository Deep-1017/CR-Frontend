import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAuth } from "./AuthContext";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
  onSale?: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "wishlist";

interface WishlistApiProduct {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  basePrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  originalPrice?: number;
  onSale?: boolean;
}

interface WishlistApiItem {
  product?: WishlistApiProduct;
}

interface WishlistResponse {
  success?: boolean;
  wishlist?: {
    items?: WishlistApiItem[];
  };
}

const readLocalWishlist = (): WishlistItem[] => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toWishlistItem = (apiItem: WishlistApiItem): WishlistItem | null => {
  const product = apiItem.product;
  const id = product?.id ?? product?._id;
  if (!id || !product?.name) {
    return null;
  }

  const image = product.image ?? product.images?.[0] ?? "/placeholder.svg";

  return {
    id,
    name: product.name,
    price: Number(product.price ?? product.basePrice ?? 0),
    image,
    category: product.category ?? "Products",
    originalPrice: typeof product.originalPrice === "number" ? product.originalPrice : undefined,
    onSale: Boolean(product.onSale),
  };
};

const toUniqueItems = (items: WishlistItem[]): WishlistItem[] => {
  const uniqueMap = new Map<string, WishlistItem>();
  for (const item of items) {
    if (!item?.id) continue;
    uniqueMap.set(item.id, item);
  }
  return Array.from(uniqueMap.values());
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
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
        setItems(readLocalWishlist());
        previousAuthRef.current = false;
        hasHydratedRef.current = true;
        return;
      }

      const localItems = readLocalWishlist();
      const justLoggedIn = !previousAuthRef.current;
      previousAuthRef.current = true;

      if (justLoggedIn && localItems.length > 0) {
        await Promise.all(
          localItems.map((item) =>
            api.post("/wishlists", { productId: item.id, variantKey: "" }).catch(() => null)
          )
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      const { data } = await api.get<WishlistResponse>("/wishlists");
      const mappedItems = toUniqueItems(
        (data?.wishlist?.items ?? []).map(toWishlistItem).filter((item): item is WishlistItem => Boolean(item))
      );
      setItems(mappedItems);
      hasHydratedRef.current = true;
    };

    hydrate().catch(() => {
      if (!hasHydratedRef.current) {
        setItems(readLocalWishlist());
        hasHydratedRef.current = true;
      }
    });
  }, [isAuthed, isLoading]);

  useEffect(() => {
    if (!hasHydratedRef.current || isAuthed) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items, isAuthed]);

  const addToWishlist = async (item: WishlistItem) => {
    if (isAuthed) {
      await api.post("/wishlists", { productId: item.id, variantKey: "" });
      setItems((prev) => {
        const next = toUniqueItems([...prev, item]);
        return next;
      });
      toast({ title: "Added to wishlist", description: `${item.name} added to your wishlist` });
      return;
    }

    setItems((prev) => {
      if (prev.some((wishlistItem) => wishlistItem.id === item.id)) {
        return prev;
      }
      toast({ title: "Added to wishlist", description: `${item.name} added to your wishlist` });
      return [...prev, item];
    });
  };

  const removeFromWishlist = async (id: string) => {
    if (isAuthed) {
      await api.delete(`/wishlists/${id}`);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Removed from wishlist" });
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist(item);
    }
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
