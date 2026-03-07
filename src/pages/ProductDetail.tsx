import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductById, getProducts } from "@/lib/api";

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '4XL'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('XS');
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
          <p className="text-gray-500 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Product not found</h1>
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
            New arrivals
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
            {/* Product Title & Subtitle */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              {product.category}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through" style={{ fontFamily: "'Inter', sans-serif" }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 tracking-wide uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                SIZE
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 px-3 rounded-full border text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

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
              >
                Add to cart
              </Button>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                Product Details
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside" style={{ fontFamily: "'Inter', sans-serif" }}>
                <li>100% cotton</li>
                <li>Machine wash</li>
                <li>Machine wash</li>
                <li>Shown: Black</li>
                <li>Style: {product.id.toUpperCase()}</li>
              </ul>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
