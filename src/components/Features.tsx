import { CreditCard, Tag, RotateCcw, Truck } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Select Payment",
      description: "Secure payments",
    },
    {
      icon: <Tag className="h-8 w-8" />,
      title: "Best Offers",
      description: "Amazing prices",
    },
    {
      icon: <RotateCcw className="h-8 w-8" />,
      title: "Return Warranty",
      description: "Easy returns",
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Quick Ship",
      description: "Fast delivery",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="p-4 md:p-6 border border-border rounded hover:border-accent hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex-shrink-0 text-primary group-hover:text-accent mb-3 transition-colors">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-sm md:text-base text-primary mb-1">{feature.title}</h3>
            <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
