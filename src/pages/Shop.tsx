"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { formatINR } from "@/lib/utils";

type CategoryNode = {
  label: string;
  children?: string[];
};

const CATEGORY_TREE: CategoryNode[] = [
  { label: "Amplifier", children: ["Amplifier", "Power Amplifier"] },
  { label: "Microphone", children: ["Wired", "Wireless"] },
  { label: "Mixers" },
  {
    label: "Portable Speakers",
    children: ["Active Speaker", "Trolly Speaker"],
  },
  { label: "Speakers", children: ["Horn Speaker"] },
  {
    label: "Unit Driver",
    children: ["Driver Unit", "Reflex Horn"],
  },
  {
    label: "Drivers",
    children: ["HF Drivers", "Tweeters", "Network Drivers"],
  },
  {
    label: "Crossover",
    children: ["Crossover", "Digital Crossover"],
  },
  { label: "Megaphones" },
  { label: "Conference System", children: ["Wired", "Wireless"] },
  { label: "Audio Splitter" },
  { label: "Line Array Loudspeaker" },
  {
    label: "Intellection Speaker",
    children: ["Wall Speaker", "Ceiling Speaker"],
  },
  {
    label: "Stands",
    children: ["Microphone Stands", "Speaker Stands"],
  },
];

const FEATURED_BRANDS = [
  "Ahuja",
  "StudioMaster",
  "DynaTech",
  "Digimore",
  "NX Audio",
  "P. Audio",
  "Sound Craft",
  "Stranger",
  "Dbx",
  "Pioneer",
  "Dasska",
  "Yamaha",
  "Real Audio",
  "ITS",
  "A Plus",
  "Tauras",
  "Musimax",
  "AudioTone",
  "Sousys",
  "NV mark",
  "Dynamite",
  "Nlabs",
];

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  const getCategoryChildren = (category: string) =>
    CATEGORY_TREE.find((node) => node.label === category)?.children ?? [];

  const expandSelectedCategories = (selected: string[]) => {
    const set = new Set(selected);
    selected.forEach((cat) => {
      getCategoryChildren(cat).forEach((child) => set.add(child));
    });
    return set;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const set = new Set(prev);
      if (set.has(category)) {
        set.delete(category);
        getCategoryChildren(category).forEach((child) => set.delete(child));
      } else {
        set.add(category);
        getCategoryChildren(category).forEach((child) => set.add(child));
      }
      return Array.from(set);
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get dynamic brands from fetched data, merge with featured brands
  const brands = Array.from(
    new Set([...FEATURED_BRANDS, ...products.map((p) => p.brand)]),
  );

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand &&
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const selectedCategorySet =
        selectedCategories.length === 0
          ? null
          : expandSelectedCategories(selectedCategories);

      const matchesCategory =
        !selectedCategorySet || selectedCategorySet.has(product.category);
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      return (
        matchesSearch &&
        matchesPrice &&
        matchesCategory &&
        matchesBrand
      );
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popularity":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [
    products,
    searchQuery,
    priceRange,
    selectedCategories,
    selectedBrands,
    sortBy,
  ]);

  const toggleFilter = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 5000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading instruments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <span className="text-accent text-xs font-semibold uppercase tracking-wider mb-2 block">
            Browse Our Collection
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Shop All Instruments
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover our carefully curated selection of premium musical
            instruments & equipment
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-semibold mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instruments, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <Slider
                min={0}
                max={5000}
                step={50}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatINR(priceRange[0])}</span>
                <span>{formatINR(priceRange[1])}</span>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {CATEGORY_TREE.map((node) => (
                  <div key={node.label}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${node.label}`}
                        checked={selectedCategories.includes(node.label)}
                        onCheckedChange={() => toggleCategory(node.label)}
                      />
                      <label
                        htmlFor={`cat-${node.label}`}
                        className="text-sm cursor-pointer"
                      >
                        {node.label}
                      </label>
                    </div>
                    {node.children && (
                      <div className="ml-5 mt-2 space-y-2">
                        {node.children.map((child) => (
                          <div
                            key={child}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`cat-${child}`}
                              checked={selectedCategories.includes(child)}
                              onCheckedChange={() => toggleCategory(child)}
                            />
                            <label
                              htmlFor={`cat-${child}`}
                              className="text-sm cursor-pointer"
                            >
                              {child}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="font-semibold mb-3">Brands</h3>
              <div className="space-y-2">
                {FEATURED_BRANDS.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() =>
                        toggleFilter(brand, setSelectedBrands)
                      }
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="text-sm cursor-pointer"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={clearAllFilters}
            >
              Reset Filters
            </Button>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} instrument
                {filteredProducts.length !== 1 ? "s" : ""}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No instruments found
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id ?? product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
