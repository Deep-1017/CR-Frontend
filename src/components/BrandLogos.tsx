const BrandLogos = () => {
  const brands = [
    { name: "Fender", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Fender_guitars_logo.svg/320px-Fender_guitars_logo.svg.png" },
    { name: "Gibson", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gibson_Guitar_Corporation_logo.svg/320px-Gibson_Guitar_Corporation_logo.svg.png" },
    { name: "Yamaha", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Logo_yamaha.svg/320px-Logo_yamaha.svg.png" },
    { name: "Roland", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Roland_logo.svg/320px-Roland_logo.svg.png" },
    { name: "Pearl", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Pearl_drums_logo.svg/320px-Pearl_drums_logo.svg.png" },
    { name: "Shure", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Shure_logo.svg/320px-Shure_logo.svg.png" },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 border-border">
      <div className="text-center mb-12">
        <span className="text-xs md:text-sm font-semibold text-accent tracking-widest uppercase mb-3 inline-block">
          Our Brands
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
          Trusted by Leading Instrument Brands
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We partner with the world's most respected instrument manufacturers to bring you only the finest quality gear.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="flex items-center justify-center h-20 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer opacity-70 hover:opacity-100"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span style="font-size:18px;font-weight:800;letter-spacing:-1px;color:#374151">${brand.name}</span>`;
                }
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandLogos;
