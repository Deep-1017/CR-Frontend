'use client';

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  // Musical instrument images
  const heroImages = [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=550&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&h=550&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=550&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=550&fit=crop&crop=top",
  ];

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Text Content */}
      <div className="relative z-30 container mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-2 md:pb-4">
        {/* Decorative sparkles */}
        <div className="absolute top-8 left-8 md:left-16 text-gray-300 text-xs">✦</div>
        <div className="absolute top-16 right-1/3 text-gray-300 text-xs">✦</div>

        <div className="max-w-7xl mx-auto text-center">
          {/* Subtitle */}
          <p className="text-xs md:text-sm font-medium text-gray-500 tracking-widest uppercase mb-4 md:mb-6"
             style={{ fontFamily: "'Inter', sans-serif" }}>
            Play What You Love
          </p>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 md:mb-6 leading-[1.15]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Find Your Perfect Sound with CR Music: <br />Where Music Meets Passion
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-7 md:mb-9 leading-relaxed"
             style={{ fontFamily: "'Inter', sans-serif" }}>
            Discover a world of premium instruments, professional studio gear, and everything you need to craft your signature sound.
            From beginner to professional — find the perfect instrument for your musical journey.
          </p>

          {/* CTA Button */}
          <Button
            className="px-8 py-3 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-full transition-all duration-300"
            onClick={() => navigate("/shop")}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Shop Instruments
          </Button>
        </div>
      </div>

      {/* Curved Background with Images grid */}
      <div className="relative -mt-6 sm:-mt-10 md:-mt-16 lg:-mt-24 w-full max-w-[1800px] mx-auto overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] lg:h-[650px] z-10">
        {/* The 4 images grid */}
        <div className="absolute inset-0 grid grid-cols-4 gap-1 sm:gap-4 px-1 sm:px-4">
          {heroImages.map((img, index) => (
            <div key={index} className="relative w-full h-full bg-gray-100 overflow-hidden">
              <img
                src={img}
                alt={`Musical instrument ${index + 1}`}
                className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Top white curve masking */}
        <div className="absolute top-[-2px] left-[-5%] right-[-5%] h-16 sm:h-24 md:h-32 lg:h-48 bg-white z-10 pointer-events-none"
             style={{
               borderRadius: '0 0 50% 50% / 0 0 100% 100%',
             }}
        />

        {/* Bottom white curve masking */}
        <div className="absolute bottom-[-2px] left-[-5%] right-[-5%] h-16 sm:h-24 md:h-32 lg:h-48 bg-white z-10 pointer-events-none"
             style={{
               borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
             }}
        />
        
        {/* Decorative sparkles */}
        <div className="absolute bottom-[20%] left-[20%] text-gray-300 text-xs z-20 pointer-events-none">✦</div>
        <div className="absolute top-[20%] right-[20%] text-gray-300 text-xs z-20 pointer-events-none">✦</div>
      </div>
    </section>
  );
};

export default Hero;
