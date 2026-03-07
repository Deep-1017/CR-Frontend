'use client';

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GuitarCollection = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Decorative sparkles */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-300 text-xs">✦</span>
        <span className="text-gray-300 text-xs">✦</span>
      </div>

      {/* Season Sale Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a1a2e] min-h-[300px] md:min-h-[350px]">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Text Content */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-3"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
              Limited Time Offer
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Save 50% this<br />Holiday Season
            </h2>
            <p className="text-sm md:text-base text-gray-300 mb-6 md:mb-8 max-w-md leading-relaxed"
               style={{ fontFamily: "'Inter', sans-serif" }}>
              It's time to upgrade your setup without breaking the bank! Dive into our exclusive 50% off sale and discover unbeatable deals on premium instruments and studio gear.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-amber-400 text-gray-900 text-sm font-semibold rounded-full hover:bg-amber-300 transition-all w-fit"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Shop the Sale <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Image */}
          <div className="relative min-h-[200px] md:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=500&fit=crop"
              alt="Holiday Guitar Sale"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Bottom decorative sparkle */}
      <div className="flex justify-center mt-6">
        <span className="text-gray-300 text-xs">✦</span>
      </div>
    </section>
  );
};

export default GuitarCollection;
