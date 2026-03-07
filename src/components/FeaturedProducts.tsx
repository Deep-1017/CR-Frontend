import React, { useState, useRef } from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = ['Guitars', 'Bass', 'Drums & Percussion', 'Keyboards', 'Wind Instruments', 'DJ & Electronics', 'Accessories'];

const categoryProducts: Record<string, Array<{
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
}>> = {
  'Guitars': [
    { id: 'gt-001', name: 'Fender Stratocaster', subtitle: "Electric Guitar", price: 1499, image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=500&fit=crop' },
    { id: 'gt-002', name: 'Gibson Les Paul', subtitle: "Electric Guitar", price: 2499, image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&h=500&fit=crop' },
    { id: 'gt-003', name: 'Yamaha Pacifica', subtitle: "Electric Guitar", price: 399, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop' },
    { id: 'gt-004', name: 'Martin D-28', subtitle: "Acoustic Guitar", price: 2999, image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=500&fit=crop' },
    { id: 'gt-005', name: 'Taylor 214ce', subtitle: "Acoustic-Electric", price: 1199, image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=500&fit=crop' },
  ],
  'Bass': [
    { id: 'bs-001', name: 'Fender Precision Bass', subtitle: "Electric Bass", price: 849, image: 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=400&h=500&fit=crop' },
    { id: 'bs-002', name: 'Music Man StingRay', subtitle: "Electric Bass", price: 2199, image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=500&fit=crop' },
  ],
  'Drums & Percussion': [
    { id: 'dr-001', name: 'Pearl Export Kit', subtitle: "5-Piece Drum Set", price: 899, image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=500&fit=crop' },
    { id: 'dr-002', name: 'Roland TD-17KVX', subtitle: "Electronic Drum Kit", price: 1799, image: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=400&h=500&fit=crop' },
  ],
  'Keyboards': [
    { id: 'kb-001', name: 'Yamaha P-515', subtitle: "Digital Piano", price: 1499, image: 'https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=400&h=500&fit=crop' },
    { id: 'kb-002', name: 'Roland JUNO-DS88', subtitle: "Synthesizer", price: 1099, image: 'https://images.unsplash.com/photo-1580234831239-3b6c6bca3944?w=400&h=500&fit=crop' },
  ],
  'Wind Instruments': [
    { id: 'wi-001', name: 'Selmer Alto Saxophone', subtitle: "Alto Sax", price: 4299, image: 'https://images.unsplash.com/photo-1572195726070-a1b8e2c3a3e2?w=400&h=500&fit=crop' },
    { id: 'wi-002', name: 'Yamaha YFL-222 Flute', subtitle: "Student Flute", price: 349, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=500&fit=crop' },
  ],
  'DJ & Electronics': [
    { id: 'dj-001', name: 'Pioneer DDJ-REV7', subtitle: "DJ Controller", price: 1299, image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=500&fit=crop' },
    { id: 'dj-002', name: 'Numark Mixtrack Pro FX', subtitle: "Beginner Controller", price: 249, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=500&fit=crop' },
  ],
  'Accessories': [
    { id: 'ac-001', name: 'Ernie Ball Strings 6-Pack', subtitle: "Electric Guitar Strings", price: 39, image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=500&fit=crop' },
    { id: 'ac-002', name: 'Roland KC-15M Amp', subtitle: "Keyboard Amplifier", price: 299, image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=500&fit=crop' },
  ],
};

export const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('Guitars');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const products = categoryProducts[activeCategory] || [];

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white" id="shop">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-gray-300 text-xs">✦</span>
          </div>
          <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mb-3"
             style={{ fontFamily: "'Inter', sans-serif" }}>
            Handpicked For You
          </p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Latest Arrivals by Category
            </h2>
            <span className="text-gray-300 text-xs">✦</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-4"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[260px] md:w-[280px] cursor-pointer group"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Product Card */}
                <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-3">
                  {/* Price Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-sm font-semibold text-gray-900"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                      $ {product.price}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {product.subtitle}
                    </p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors mt-0.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Right Arrow */}
          {products.length > 3 && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;