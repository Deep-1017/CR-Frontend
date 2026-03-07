const BrandLogos = () => {
  const brands = [
    { name: "BOSS", logo: "https://toppng.com/uploads/preview/boss-music-logo-vector-download-free-11574145003zd2gus2xzi.png" },
    { name: "JBL", logo: "https://w7.pngwing.com/pngs/1022/23/png-transparent-jbl-logo-thumbnail.png" },
    { name: "PHLOX", logo: "https://cdn.myportfolio.com/3d766dd8-f5f5-4640-8d11-41e0fc61b2a0/00c70ba8-fb69-4a11-b5fd-799ce4e07d38.png?h=78e832224af941bfe04893d451be558c" },
    {
      name: "GOLDEN TONE",
      logo: "https://media.istockphoto.com/id/2209325456/vector/golden-star-shape-with-sparks-effect.jpg?s=1024x1024&w=is&k=20&c=GC25up7J8gDegbN6OBoLuAMoEb7ioMXurlnsRdXL1l8=",
    },
    { name: "SWEETY", logo: "https://via.placeholder.com/120x60?text=SWEETY" },
    { name: "J.R.", logo: "https://via.placeholder.com/120x60?text=J.R." },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 border-border">
      <div className="text-center mb-12">
        <span className="text-xs md:text-sm font-semibold text-accent tracking-widest uppercase mb-3 inline-block">
          Our Brands
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">
          Trusted by Leading Music Brands
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          As a user, it is important to have a positive experience when using a
          website or app.
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
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandLogos;
