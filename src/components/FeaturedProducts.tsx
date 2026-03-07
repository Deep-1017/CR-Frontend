import React, { useState, useRef } from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = ['Shirts', 'Shorts', 'Jacket', 'Hoodies', 'Trousers', 'Shoes', 'Accessories'];

const categoryProducts: Record<string, Array<{
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
}>> = {
  'Shirts': [
    { id: 'sh-001', name: 'Nike Dri-FIT', subtitle: "Men's T-shirt", price: 60, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop' },
    { id: 'sh-002', name: 'Sportswear Max90', subtitle: "Men's T-shirt", price: 55, image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop' },
    { id: 'sh-003', name: 'Sportswear Essentials', subtitle: "Women's T-shirt", price: 40, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop' },
    { id: 'sh-004', name: 'Sportswear Club', subtitle: "Men's T-shirt", price: 70, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop' },
    { id: 'sh-005', name: 'Premium Cotton Tee', subtitle: "Unisex T-shirt", price: 45, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop' },
  ],
  'Shorts': [
    { id: 'sr-001', name: 'Athletic Shorts', subtitle: "Men's Shorts", price: 45, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop' },
    { id: 'sr-002', name: 'Casual Chino Shorts', subtitle: "Men's Shorts", price: 55, image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=500&fit=crop' },
  ],
  'Jacket': [
    { id: 'jk-001', name: 'Bomber Jacket', subtitle: "Men's Jacket", price: 120, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop' },
    { id: 'jk-002', name: 'Denim Jacket', subtitle: "Women's Jacket", price: 95, image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400&h=500&fit=crop' },
  ],
  'Hoodies': [
    { id: 'hd-001', name: 'Pullover Hoodie', subtitle: "Unisex Hoodie", price: 80, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop' },
    { id: 'hd-002', name: 'Zip-Up Hoodie', subtitle: "Men's Hoodie", price: 90, image: 'https://images.unsplash.com/photo-1578768079470-a84c2750981b?w=400&h=500&fit=crop' },
  ],
  'Trousers': [
    { id: 'tr-001', name: 'Slim Fit Chinos', subtitle: "Men's Trousers", price: 65, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop' },
  ],
  'Shoes': [
    { id: 'se-001', name: 'Running Sneakers', subtitle: "Unisex Shoes", price: 110, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop' },
  ],
  'Accessories': [
    { id: 'ac-001', name: 'Leather Belt', subtitle: "Men's Accessories", price: 35, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop' },
  ],
};

export const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('Shirts');
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
            Updated Trends For You
          </p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Latest Arrivals by Categories
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