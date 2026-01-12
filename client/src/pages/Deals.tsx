import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProducts } from "@/hooks/use-products";
import { Search, Filter, Flame, Shield, Truck, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export default function Deals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("All Deals");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const { data: products, isLoading } = useProducts({ 
    search: searchTerm,
  });

  // Filter products for deals (mocking deals with price < 500k or just show all for now)
  const deals = products?.filter(p => p.price < 500000 || p.isFeatured) || [];
  
  const filteredDeals = deals.filter(p => {
    if (category !== "All Deals" && p.category !== category) return false;
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  });

  const categories = ["All Deals", "Smartphones", "Laptops", "Tablets", "Smartwatches", "Accessories"];
  const brands = ["Apple", "Samsung", "Google", "Others"];
  const conditions = ["New", "Refurbished", "Used"];

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Categories</h3>
        <div className="space-y-2">
          {categories.slice(1).map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox 
                id={cat} 
                checked={category === cat}
                onCheckedChange={() => setCategory(cat)}
              />
              <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {cat}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox 
                id={brand} 
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  setSelectedBrands(prev => 
                    checked ? [...prev, brand] : prev.filter(b => b !== brand)
                  );
                }}
              />
              <label htmlFor={brand} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Price Range</h3>
        <Slider
          defaultValue={[0, 2000000]}
          max={2000000}
          step={50000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mt-6"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>0 RWF</span>
          <span>2M RWF</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <WhatsAppFloat />

      {/* Hero Deals Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-16 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1 text-sm font-bold text-primary backdrop-blur-md border border-primary/20">
              <Flame className="h-4 w-4" />
              HOT DEALS
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Hot Deals</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Limited time offers on refurbished tech. Save up to 40% on top brands.
            </p>
            
            <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {deals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10">
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">Save 40%</span>
                  <div className="mb-4 aspect-square h-32 w-full">
                    <img src={deal.imageUrl} alt={deal.name} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="font-bold text-white">{deal.name}</h3>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm text-slate-400 line-through">{(deal.price * 1.4).toLocaleString()} RWF</span>
                    <span className="text-lg font-black text-primary">{deal.price.toLocaleString()} RWF</span>
                  </div>
                  <Button className="mt-4 w-full rounded-xl font-bold">Shop Now</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="sticky top-[112px] z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-bold transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          
          {/* Sidebar Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-40 space-y-8">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-xl py-6 font-bold">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filters
                  </span>
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
                <div className="py-8">
                  <h2 className="mb-8 text-2xl font-black">Filters</h2>
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No deals found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredDeals.map((product) => (
                  <ProductCard key={product.id} product={product} isDeal={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-muted/30 py-20 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black tracking-tight">Premium Refurbished. Trusted Quality.</h2>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Warranty Included</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Quality Tested</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
