const BrandLogos = () => {
  const brands = [
    { name: "Ahuja", logo: "https://via.placeholder.com/320x120?text=Ahuja" },
    { name: "StudioMaster", logo: "https://via.placeholder.com/320x120?text=StudioMaster" },
    { name: "DynaTech", logo: "https://via.placeholder.com/320x120?text=DynaTech" },
    { name: "Digimore", logo: "https://via.placeholder.com/320x120?text=Digimore" },
    { name: "NX Audio", logo: "https://via.placeholder.com/320x120?text=NX%20Audio" },
    { name: "P. Audio", logo: "https://via.placeholder.com/320x120?text=P.%20Audio" },
    { name: "Sound Craft", logo: "https://via.placeholder.com/320x120?text=Sound%20Craft" },
    { name: "Stranger", logo: "https://via.placeholder.com/320x120?text=Stranger" },
    { name: "Dbx", logo: "https://via.placeholder.com/320x120?text=Dbx" },
    { name: "Pioneer", logo: "https://via.placeholder.com/320x120?text=Pioneer" },
    { name: "Dasska", logo: "https://via.placeholder.com/320x120?text=Dasska" },
    { name: "Yamaha", logo: "https://via.placeholder.com/320x120?text=Yamaha" },
    { name: "Real Audio", logo: "https://via.placeholder.com/320x120?text=Real%20Audio" },
    { name: "ITS", logo: "https://via.placeholder.com/320x120?text=ITS" },
    { name: "A Plus", logo: "https://via.placeholder.com/320x120?text=A%20Plus" },
    { name: "Tauras", logo: "https://via.placeholder.com/320x120?text=Tauras" },
    { name: "Musimax", logo: "https://via.placeholder.com/320x120?text=Musimax" },
    { name: "AudioTone", logo: "https://via.placeholder.com/320x120?text=AudioTone" },
    { name: "Sousys", logo: "https://via.placeholder.com/320x120?text=Sousys" },
    { name: "NV mark", logo: "https://via.placeholder.com/320x120?text=NV%20mark" },
    { name: "Dynamite", logo: "https://via.placeholder.com/320x120?text=Dynamite" },
    { name: "Nlabs", logo: "https://via.placeholder.com/320x120?text=Nlabs" },
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
