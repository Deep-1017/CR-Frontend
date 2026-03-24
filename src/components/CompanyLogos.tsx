import React from 'react';

const logos = [
  "a-plus.png",
  "ahuja.png",
  "audiotone.png",
  "dasska.png",
  "dbx.png",
  "digimore.webp",
  "dynamite.avif",
  "dynatech.jpg",
  "musimax.avif",
  "numark.png",
  "nx-audio.png",
  "p-audio.png",
  "pioneer.png",
  "real-audio.png",
  "soundcraft.png",
  "sousys.webp",
  "stranger.png",
  "studiomaster.png",
  "yamaha.png"
];

const CompanyLogos = () => {
  return (
    <section className="py-16 bg-white border-y border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 tracking-tight">
          Trusted by Top Brands
        </h2>
        <p className="text-gray-500 text-center mt-3 text-lg max-w-2xl mx-auto">
          We partner with industry-leading brands to bring you the best professional audio equipment.
        </p>
      </div>

      <div className="relative flex overflow-hidden group">
        {/* Left and right fade overlays for better aesthetic */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div className="flex animate-marquee group-hover:[animation-play-state:paused] w-max">
          {/* First set of logos */}
          <div className="flex items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <div 
                key={`logo-1-${index}`} 
                className="flex items-center justify-center w-36 h-24 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md hover:border-gray-300 grayscale hover:grayscale-0 opacity-75 hover:opacity-100"
              >
                <img 
                  src={`/CompanyLogo/${logo}`} 
                  alt={logo.split('.')[0]} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
          {/* Second set of logos for seamless looping */}
          <div className="flex items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <div 
                key={`logo-2-${index}`} 
                className="flex items-center justify-center w-36 h-24 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md hover:border-gray-300 grayscale hover:grayscale-0 opacity-75 hover:opacity-100"
              >
                <img 
                  src={`/CompanyLogo/${logo}`} 
                  alt={logo.split('.')[0]} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;
