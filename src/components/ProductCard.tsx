'use client';

import React from "react"
import { ShoppingBag, Award } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  brand?: string;
}


const ProductCard = ({
  id,
  image,
  name,
  category,
  price,
  originalPrice,
  onSale,
  brand,
}: ProductCardProps) => {
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${id}`)}
    >
      {/* Product Image */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-3">
        {/* Price Tag */}
        <div className="absolute top-4 left-4 z-10">
          <span className="text-sm font-semibold text-gray-900"
                style={{ fontFamily: "'Inter', sans-serif" }}>
            {formatINR(price)}
          </span>
        </div>

        {/* Sale Badge */}
        {onSale && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
              Sale
            </span>
          </div>
        )}

        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Brand badge */}
          {brand && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
              <Award className="w-2.5 h-2.5" /> {brand}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate"
              style={{ fontFamily: "'Inter', sans-serif" }}>
            {name}
          </h3>
          <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            {category}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          title="Choose options"
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors mt-0.5 flex-shrink-0 ml-2"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
