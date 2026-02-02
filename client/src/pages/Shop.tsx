import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProducts } from "@/hooks/use-products";
import { Search, Filter, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LAPTOP_OPTIONS = {
  batteryHealth: ["100%", "90%+", "80%+"],
  charger: ["Included", "Not Included"],
  color: ["Aluminum", "Black", "Carbon Fiber", "Gold", "Gray", "Matte Black"],
  condition: ["Premium", "Excellent", "Good", "Acceptable"],
  cpu: ["Apple M1 / M2 / M3", "Intel i3 / i5 / i7 / i9", "AMD Ryzen"],
  ram: ["8GB", "16GB", "32GB", "64GB"],
  screenSize: ["12\"", "13\"", "14\"", "15\"", "16\""],
  storage: ["128GB", "256GB", "512GB", "1TB", "2TB"],
  touchBar: ["Touch Bar", "No Touch Bar"]
};

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [laptopFilters, setLaptopFilters] = useState<Record<string, string[]>>({});
  
  // Use debounced search in real app, simplified here
  const { data: allProducts, isLoading } = useProducts({ 
    search: searchTerm, 
    category: category === "All" ? undefined : category 
  });

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (category !== "Laptops" || Object.keys(laptopFilters).length === 0) return allProducts;

    return allProducts.filter(product => {
      const specs = product.specs as Record<string, string> || {};
      return Object.entries(laptopFilters).every(([key, values]) => {
        if (values.length === 0) return true;
        return values.includes(specs[key]);
      });
    });
  }, [allProducts, category, laptopFilters]);

  const toggleLaptopFilter = (key: string, value: string) => {
    setLaptopFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const categories = ["All", "Smartphones", "Audio", "Phones Accessories", "Laptops", "Tablets", "Gaming Consoles", "Smartwatches", "Cameras"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <WhatsAppFloat />

      {/* Header */}
      <div className="bg-card border-b border-border py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Our Shop</h1>
          <p className="mt-2 text-sm lg:text-base text-muted-foreground">Discover premium electronics at unbeatable prices.</p>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:gap-6 lg:flex-row">
          
          {/* Sidebar Filters */}
          <aside className="w-full space-y-6 lg:w-64 lg:shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-md py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setLaptopFilters({});
                    }}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 lg:w-full ${
                      (category === cat || (cat === "All" && !category))
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Laptop Specific Filters */}
            {category === "Laptops" && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Laptop Filters</h3>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(LAPTOP_OPTIONS).map(([key, options]) => (
                    <AccordionItem key={key} value={key} className="border-none">
                      <AccordionTrigger className="py-2 text-sm font-semibold capitalize hover:no-underline">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-1">
                          {options.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`filter-${key}-${option}`}
                                checked={laptopFilters[key]?.includes(option)}
                                onCheckedChange={() => toggleLaptopFilter(key, option)}
                              />
                              <label 
                                htmlFor={`filter-${key}-${option}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
               <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="aspect-square rounded-xl bg-accent animate-pulse" />
                ))}
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Filter className="mb-4 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No products found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setSearchTerm(""); setCategory(undefined); setLaptopFilters({}); }}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}