import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Award, ChevronRight, Heart, Minus, Plus, Tag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import VariantSelector, { type ProductVariant } from "@/components/VariantSelector";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getProductById, getProducts } from "@/lib/api";
import { formatINR } from "@/lib/utils";

interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductSpecification {
  label: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  basePrice?: number;
  originalPrice?: number;
  onSale?: boolean;
  image: string;
  images?: string[];
  description: string;
  inStock?: boolean;
  stockCount?: number;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  customerReviews?: ProductReview[];
  variantSourceCount?: number;
  invalidVariantCount?: number;
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
  Array.isArray(value) ? value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : [])) : [];

const normalizeVariant = (value: unknown): ProductVariant | null => {
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

  const normalized: ProductVariant = {
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

const normalizeProduct = (raw: unknown, fallbackId: string): Product => {
  const source = isRecord(raw) && isRecord(raw.product) ? raw.product : raw;
  const product = isRecord(source) ? source : {};

  const variantEntries = Array.isArray(product.variants) ? product.variants : [];
  const variants = variantEntries
    .map((variant) => normalizeVariant(variant))
    .filter((variant): variant is ProductVariant => Boolean(variant));

  const images = readStringArray(product.images);
  const image = images[0] ?? readString(product.image) ?? "/placeholder.svg";
  const specifications = Array.isArray(product.specifications)
    ? product.specifications.flatMap((spec) => {
        if (!isRecord(spec)) {
          return [];
        }

        const label = readString(spec.label);
        const value = readString(spec.value);
        return label && value ? [{ label, value }] : [];
      })
    : [];
  const customerReviews = Array.isArray(product.customerReviews)
    ? product.customerReviews.flatMap((review) => {
        if (!isRecord(review)) {
          return [];
        }

        const id = readString(review.id);
        const author = readString(review.author);
        const rating = readNumber(review.rating);
        const date = readString(review.date);
        const comment = readString(review.comment);

        return id && author && rating !== undefined && date && comment
          ? [{ id, author, rating, date, comment }]
          : [];
      })
    : [];

  return {
    id: readString(product.id) ?? readString(product._id) ?? fallbackId,
    name: readString(product.name) ?? "Unnamed product",
    category: readString(product.category) ?? "Instruments",
    brand: readString(product.brand) ?? "Unknown brand",
    price: readNumber(product.price) ?? readNumber(product.basePrice) ?? 0,
    basePrice: readNumber(product.basePrice),
    originalPrice: readNumber(product.originalPrice),
    onSale: Boolean(product.onSale),
    image,
    images: images.length > 0 ? images : [image],
    description: readString(product.description) ?? "",
    inStock: typeof product.inStock === "boolean" ? product.inStock : undefined,
    stockCount: readNumber(product.stockCount),
    variants,
    specifications,
    customerReviews,
    variantSourceCount: variantEntries.length,
    invalidVariantCount: Math.max(0, variantEntries.length - variants.length),
  };
};

const getVariantId = (variant: ProductVariant): string =>
  variant.variantId ?? variant._id ?? variant.sku;

const getBasePrice = (product: Product): number => product.basePrice ?? product.price;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedConfiguration, setSelectedConfiguration] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const productQuery = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => normalizeProduct(await getProductById(id as string), id as string),
    enabled: Boolean(id),
    retry: false,
  });

  const product = productQuery.data;

  const relatedQuery = useQuery<Product[]>({
    queryKey: ["related-products", product?.category, product?.id],
    queryFn: async () => {
      const allProducts = (await getProducts()) as Product[];
      return allProducts
        .filter((candidate) => candidate.category === product?.category && candidate.id !== product?.id)
        .slice(0, 4);
    },
    enabled: Boolean(product?.category && product?.id),
  });

  const variants = useMemo(() => product?.variants ?? [], [product?.variants]);
  const selectedVariantImages = selectedVariant?.images?.filter(Boolean) ?? [];
  const productImages = product?.images?.filter(Boolean) ?? [];
  const images =
    selectedVariantImages.length > 0
      ? selectedVariantImages
      : productImages.length > 0
        ? productImages
        : product?.image
          ? [product.image]
          : [];
  const hasSelectableVariants = variants.length > 0;
  const isSelectionComplete = Boolean(selectedConfiguration && selectedFinish);
  const addDisabled =
    !hasSelectableVariants ||
    !isSelectionComplete ||
    !selectedVariant ||
    selectedVariant.stock <= 0 ||
    quantity > selectedVariant.stock;
  const inWishlist = product ? isInWishlist(product.id) : false;
  const productError = productQuery.error as AxiosError<{ message?: string }> | null;
  const isNotFound = productError?.response?.status === 404;

  useEffect(() => {
    setSelectedConfiguration(null);
    setSelectedFinish(null);
    setSelectedVariant(null);
    setSelectedImage(0);
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!selectedConfiguration || !selectedFinish) {
      setSelectedVariant(null);
      return;
    }

    const matchedVariant =
      variants.find(
        (variant) =>
          variant.configuration === selectedConfiguration && variant.finish === selectedFinish
      ) ?? null;

    setSelectedVariant(matchedVariant);
  }, [selectedConfiguration, selectedFinish, variants]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [selectedVariant]);

  if (productQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white" aria-busy="true">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          <p className="text-sm text-gray-500">Loading instrument...</p>
        </div>
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-xl">
            <Alert variant="destructive">
              <AlertTitle>{isNotFound ? "Product not found" : "Unable to load product"}</AlertTitle>
              <AlertDescription>
                {isNotFound
                  ? "This product may have been removed or is no longer available."
                  : "We couldn't load this product right now. Please try again in a moment."}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate("/shop")}
                className="rounded-full bg-gray-900 px-8 text-white hover:bg-gray-800"
              >
                Back to Shop
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleConfigurationChange = (configuration: string) => {
    setSelectedConfiguration(configuration);
  };

  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedConfiguration || !selectedFinish) {
      return;
    }

    const variantId = getVariantId(selectedVariant);

    for (let i = 0; i < quantity; i += 1) {
      addToCart({
        id: `${product.id}:${variantId}`,
        productId: product.id,
        variantId,
        configuration: selectedVariant.configuration,
        finish: selectedVariant.finish,
        sku: selectedVariant.sku,
        name: product.name,
        price: selectedVariant.price ?? product.price,
        image: images[selectedImage] || product.image,
        category: product.category,
      });
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      originalPrice: product.originalPrice,
      onSale: product.onSale,
    });
  };

  const hasVariantDataIssue = (product.variantSourceCount ?? 0) > 0 && variants.length === 0;
  const hasIgnoredVariantEntries = (product.invalidVariantCount ?? 0) > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-6 md:px-8 md:py-10">
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-gray-400">
          <button onClick={() => navigate("/")} className="transition-colors hover:text-gray-700">
            Home
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <button onClick={() => navigate("/shop")} className="transition-colors hover:text-gray-700">
            Instruments
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="mb-16 grid gap-8 md:gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-gray-50">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded border-2 bg-gray-50 transition-colors ${
                      selectedImage === idx ? "border-gray-900" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                <Award className="h-3 w-3" />
                {product.brand}
              </span>
            </div>

            <h1 className="mb-1 text-2xl font-bold text-gray-900 md:text-3xl">{product.name}</h1>
            <p className="mb-4 text-sm text-gray-500">{product.category}</p>

            <div className="mb-8 flex items-center gap-3">
              <span className="text-xl font-semibold text-gray-900">{formatINR(selectedVariant?.price ?? product.price)}</span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.onSale && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                  <Tag className="h-3 w-3" /> Sale
                </span>
              )}
            </div>

            {(hasIgnoredVariantEntries || hasVariantDataIssue) && (
              <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
                <AlertTitle>Variant data issue</AlertTitle>
                <AlertDescription>
                  {hasVariantDataIssue
                    ? "This product was returned without usable variant data, so configuration selection is unavailable."
                    : "Some incomplete variant records were ignored so the page can still load safely."}
                </AlertDescription>
              </Alert>
            )}

            <VariantSelector
              variants={variants}
              basePrice={getBasePrice(product)}
              selectedConfiguration={selectedConfiguration}
              selectedFinish={selectedFinish}
              selectedVariant={selectedVariant}
              onConfigurationChange={handleConfigurationChange}
              onFinishChange={handleFinishChange}
            />

            <div className="mb-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900">
                Quantity
              </h3>
              <div className="flex h-12 w-full max-w-[200px] items-center overflow-hidden rounded-full border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-full flex-1 items-center justify-center transition-colors hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="flex-1 text-center text-sm font-medium text-gray-900">{quantity}</span>
                <button
                  onClick={() => {
                    const maxQuantity = selectedVariant?.stock ?? Number.POSITIVE_INFINITY;
                    setQuantity(Math.min(maxQuantity, quantity + 1));
                  }}
                  disabled={selectedVariant?.stock !== undefined && quantity >= selectedVariant.stock}
                  className="flex h-full flex-1 items-center justify-center transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="mb-10 flex items-center gap-3">
              <button
                onClick={handleToggleWishlist}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                  inWishlist
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-white" : ""}`} />
              </button>

              <Button
                onClick={handleAddToCart}
                className="h-12 flex-1 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                disabled={addDisabled}
              >
                {!hasSelectableVariants
                  ? "Unavailable"
                  : !isSelectionComplete
                    ? "Select Configuration and Finish"
                    : selectedVariant?.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
              </Button>
            </div>

            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Specifications</h3>
                <div className="divide-y divide-gray-100">
                  {product.specifications.map((spec) => (
                    <div key={`${spec.label}-${spec.value}`} className="flex justify-between py-2.5">
                      <span className="text-sm text-gray-500">{spec.label}</span>
                      <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Description</h3>
              <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
            </div>
          </div>
        </div>

        {product.customerReviews && product.customerReviews.length > 0 && (
          <div className="mb-16 border-t border-gray-200 pt-10">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {product.customerReviews.map((review) => (
                <div key={review.id} className="rounded-lg bg-gray-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-semibold text-white">
                      {review.author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                      <p className="text-xs text-gray-400">{review.date}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-200"}`}
                        >
                          *
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedQuery.data && relatedQuery.data.length > 0 && (
          <div className="border-t border-gray-200 pt-10">
            <h2 className="mb-6 text-xl font-bold text-gray-900">More in {product.category}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedQuery.data.map((related) => (
                <div
                  key={related.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/product/${related.id}`)}
                >
                  <div className="mb-2 aspect-square overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={related.image}
                      alt={related.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-900">{related.name}</p>
                  <p className="text-xs text-gray-500">{formatINR(related.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
