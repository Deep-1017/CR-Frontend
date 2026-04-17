'use client';

import { Search, Heart, User, Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Products", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex-shrink-0"
          >
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              CR Music
            </span>
          </button>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 whitespace-nowrap"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent"
            >
              <Search className="h-[20px] w-[20px]" strokeWidth={1.5} />
            </Button>

            {/* User */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent hidden sm:flex"
              onClick={() => navigate("/login")}
            >
              <User className="h-[20px] w-[20px]" strokeWidth={1.5} />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-[20px] w-[20px]" strokeWidth={1.5} />
              {wishlistTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistTotal > 9 ? "9+" : wishlistTotal}
                </span>
              )}
            </Button>

            {/* Cart / Bag */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col gap-3 py-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  navigate(link.href);
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-gray-700 text-left hover:text-black transition-colors py-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
