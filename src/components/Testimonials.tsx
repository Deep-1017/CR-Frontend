'use client';

import { useState } from "react";

const Testimonials = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription
    setEmail('');
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 max-w-4xl mx-auto">
          {/* Text */}
          <div className="text-center md:text-left flex-shrink-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Join Our Newsletter
            </h2>
            <p className="text-sm text-gray-500"
               style={{ fontFamily: "'Inter', sans-serif" }}>
              Get updates on new instrument arrivals, gear reviews, and exclusive deals.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="flex items-center w-full max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 bg-white border border-gray-200 rounded-l-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-r-full hover:bg-gray-800 transition-colors whitespace-nowrap"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
