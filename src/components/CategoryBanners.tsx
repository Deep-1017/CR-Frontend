'use client';

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CategoryBanners = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 md:px-8 py-12 md:py-20">
      {/* Section Header */}
      <div className="text-center mb-10 md:mb-14">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-gray-300 text-xs">✦</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Explore Our Latest Instrument Collections
          </h2>
          <span className="text-gray-300 text-xs">✦</span>
        </div>
        <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto mt-3"
           style={{ fontFamily: "'Inter', sans-serif" }}>
          Explore our curated instrument collections — from iconic guitars to professional studio gear — and find the sound that defines you.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 max-w-6xl mx-auto">
        {/* Large Left - New Arrivals in Guitars */}
        <div className="md:col-span-7 relative overflow-hidden rounded-2xl group cursor-pointer min-h-[280px] md:min-h-[340px]"
             onClick={() => navigate("/shop")}
        >
          <img
            src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=500&fit=crop"
            alt="New Arrivals in Guitars"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Arrow icon */}
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUpRight className="w-5 h-5 text-gray-900" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              New Amplifier Arrivals
            </h3>
            <p className="text-white/80 text-sm leading-relaxed max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
              Discover the latest amplifier solutions and high-power audio gear from leading manufacturers.
            </p>
          </div>
        </div>

        {/* Right Column - Best Sellers in Keyboards */}
        <div className="md:col-span-5 relative overflow-hidden rounded-2xl group cursor-pointer min-h-[280px] md:min-h-[340px]"
             onClick={() => navigate("/shop")}
        >
          <img
            src="https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=600&h=700&fit=crop"
            alt="Best Sellers in Keyboards"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Best Sellers in Microphones
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Explore industry-leading mics and recording gear for studio, podcast, and live streams.
            </p>
            <Button
              className="px-5 py-2 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-700 rounded-full transition-all"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/shop");
              }}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Shop Now <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Bottom Left - Portable Speaker */}
        <div className="md:col-span-4 relative overflow-hidden rounded-2xl group cursor-pointer min-h-[220px]"
             onClick={() => navigate("/shop")}
        >
          <img
            src="https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=500&h=400&fit=crop"
            alt="Portable Speaker Collection"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <h3 className="text-white text-lg md:text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Portable Speaker Collections
            </h3>
          </div>
        </div>

        {/* Bottom Center - Stands */}
        <div className="md:col-span-4 relative overflow-hidden rounded-2xl group cursor-pointer min-h-[220px]"
             onClick={() => navigate("/shop")}
        >
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&h=400&fit=crop"
            alt="Stands & Hardware"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <h3 className="text-white text-lg md:text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Stands & Hardware
            </h3>
          </div>
        </div>

        {/* Invisible spacer for bottom right alignment */}
        <div className="hidden md:block md:col-span-4" />
      </div>
    </section>
  );
};

export default CategoryBanners;
