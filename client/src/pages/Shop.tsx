import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProducts } from "@/hooks/use-products";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  
  // Use debounced search in real app, simplified here
  const { data: products, isLoading } = useProducts({ 
    search: searchTerm, 
    category: category === "All" ? undefined : category 
  });

  const categories = ["All", "Phones", "Audio", "Accessories", "Laptops"];

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
          <aside className="w-full space-y-4 lg:w-48 lg:shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-md py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Categories */}
            <div className="overflow-x-auto pb-1 lg:overflow-visible lg:pb-0">
              <h3 className="mb-2 hidden lg:block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
              <div className="flex flex-row gap-1.5 lg:flex-col lg:space-y-1 min-w-max lg:min-w-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap lg:w-full ${
                      (category === cat || (cat === "All" && !category))
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
               <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="aspect-square rounded-xl bg-accent animate-pulse" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Filter className="mb-4 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No products found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setSearchTerm(""); setCategory(undefined); }}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products?.map((product) => (
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
