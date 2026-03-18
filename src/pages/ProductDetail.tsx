import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, ChevronRight, Tag, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductById, getProducts } from "@/lib/api";
import { formatINR } from "@/lib/utils";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);

        const allProducts = await getProducts();
        const related = allProducts.filter(
          (p: any) => p.category === data.category && p.id !== data.id
        ).slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Loading instrument...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Instrument not found</h1>
          <Button onClick={() => navigate("/shop")} className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8">
            Back to Shop
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
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

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          <button onClick={() => navigate("/")} className="hover:text-gray-700 transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("/shop")} className="hover:text-gray-700 transition-colors">
            Instruments
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-6 gap-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-gray-50 rounded overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-gray-900" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="pt-2">
            {/* Brand & Category */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                <Award className="w-3 h-3" />
                {product.brand}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              {product.category}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl text-gray-900 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.onSale && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                  <Tag className="w-3 h-3" /> Sale
                </span>
              )}
            </div>

            {/* In Stock Indicator */}
            {product.inStock !== undefined && (
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                  {product.inStock ? `In Stock${product.stockCount ? ` (${product.stockCount} available)` : ''}` : 'Out of Stock'}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 tracking-wide uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                QUANTITY
              </h3>
              <div className="flex items-center w-full max-w-[200px] border border-gray-300 rounded-full overflow-hidden h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="flex-1 text-center font-medium text-gray-900 text-sm"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Add to Cart + Wishlist */}
            <div className="flex items-center gap-3 mb-10">
              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  inWishlist
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-gray-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-gray-900 text-white hover:bg-gray-800 rounded-full text-sm font-semibold transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}
                disabled={product.inStock === false}
              >
                {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Specifications
                </h3>
                <div className="divide-y divide-gray-100">
                  {product.specifications.map((spec: { label: string; value: string }, idx: number) => (
                    <div key={idx} className="flex justify-between py-2.5">
                      <span className="text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>{spec.label}</span>
                      <span className="text-sm font-medium text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        {product.customerReviews && product.customerReviews.length > 0 && (
          <div className="border-t border-gray-200 pt-10 mb-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Customer Reviews
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {product.customerReviews.map((review: any) => (
                <div key={review.id} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-semibold">
                      {review.author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>{review.author}</p>
                      <p className="text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>{review.date}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              More in {product.category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/product/${related.id}`)}
                >
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
                    <img
                      src={related.image}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{related.name}</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>{formatINR(related.price)}</p>
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
