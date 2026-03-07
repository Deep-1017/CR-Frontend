'use client';

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BestSellingProducts = () => {
  const navigate = useNavigate();

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Title */}
        <div className="flex items-center gap-2 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Featured
          </h2>
          <span className="text-gray-300 text-xs">✦</span>
        </div>

        {/* Decorative sparkle */}
        <div className="flex justify-center mb-4">
          <span className="text-gray-300 text-xs">✦</span>
        </div>

        {/* Two Feature Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Bottega Veneta Women Exclusive Series */}
          <div
            className="relative overflow-hidden rounded-2xl group cursor-pointer min-h-[300px] md:min-h-[380px]"
            onClick={() => navigate("/shop")}
          >
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&h=500&fit=crop"
              alt="Bottega Veneta Women Exclusive Series"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h3 className="text-white text-xl md:text-2xl font-bold mb-3 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                Bottega Veneta Women<br />Exclusive Series
              </h3>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 text-gray-900 text-xs font-semibold rounded-full hover:bg-white transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Street Wear Style Trend Collection */}
          <div
            className="relative overflow-hidden rounded-2xl group cursor-pointer min-h-[300px] md:min-h-[380px]"
            onClick={() => navigate("/shop")}
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&h=500&fit=crop"
              alt="Street Wear Style Trend Collection"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h3 className="text-white text-xl md:text-2xl font-bold mb-3 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                Street Wear Style Trend<br />Collection
              </h3>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 text-gray-900 text-xs font-semibold rounded-full hover:bg-white transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellingProducts;
