import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryBanners from "@/components/CategoryBanners";
import GuitarCollection from "@/components/GuitarCollection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import BestSellingProducts from "@/components/BestSellingProducts";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CategoryBanners />
      <FeaturedProducts />
      <BestSellingProducts />
      <GuitarCollection />
      {/* <Testimonials /> */}
      <Footer />
    </div>
  );
};

export default Index;