'use client';

import { Search, Heart, User, Menu, X, ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Products", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "CR";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent hidden sm:flex overflow-hidden rounded-full"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-8 w-8 border border-stone-200">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-stone-100 text-[11px] font-semibold text-stone-700">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2 w-60">
                  <DropdownMenuLabel className="space-y-0.5">
                    <div className="text-sm font-semibold text-stone-900">{user?.name}</div>
                    <div className="text-xs font-normal text-stone-500">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-700 hover:text-black hover:bg-transparent hidden sm:flex"
                onClick={() => navigate("/login")}
                aria-label="Open login page"
              >
                <User className="h-[20px] w-[20px]" strokeWidth={1.5} />
              </Button>
            )}

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
            <button
              onClick={() => {
                navigate(isAuthenticated ? "/account" : "/login");
                setMobileMenuOpen(false);
              }}
              className="text-sm font-medium text-gray-700 text-left hover:text-black transition-colors py-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {isAuthenticated ? "My Account" : "Login"}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
