import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatINR } from "@/lib/utils";

const Wishlist = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <span className="text-muted-foreground">({items.length} items)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite items to view them later
            </p>
            <Button onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all"
              >
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <div
                  className="aspect-square overflow-hidden bg-secondary cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{item.category}</p>
                  <h3
                    className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold">{formatINR(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatINR(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
