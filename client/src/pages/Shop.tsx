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
      <div className="bg-card border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground">Our Shop</h1>
          <p className="mt-2 text-muted-foreground">Discover premium electronics at unbeatable prices.</p>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          
          {/* Sidebar Filters */}
          <aside className="w-full space-y-8 lg:w-64 lg:shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                      (category === cat || (cat === "All" && !category))
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="aspect-[4/5] rounded-2xl bg-accent animate-pulse" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setSearchTerm(""); setCategory(undefined); }}
                  className="mt-6 text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
