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
              CR Music
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your destination for premium musical instruments and studio equipment. Craft your sound with us.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Amplifier</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Microphone</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Portable Speaker</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Crossover</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Stands</a></li>
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
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Payment Options</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            © 2025 CR Music. All rights reserved.
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
              {/* YouTube icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
