import { Twitter, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-14 md:py-16">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              StyleHub
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Design amazing digital experiences that create more happy in the world.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Men's Product</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Women's Product</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Winter Edition</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Accessories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Discounts</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              Company
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>About us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Investors</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>News</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Purpose</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              Support
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Order Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Shipping & Delivery</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Returns</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Payment Option</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            © 2021 StyleHub. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              {/* Pinterest icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
