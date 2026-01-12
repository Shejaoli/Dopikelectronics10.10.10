import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Gamepad2,
  Headphones,
  Wrench,
  Monitor,
  Trash2,
  Tv,
  Users,
  Timer
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const heroImg = "/images/iphone-17-pro-max-1.png";

const HomeHero = () => {
  return (
    <section className="relative bg-slate-950 text-white overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Refurbished <br />
              <span className="text-primary">iPads & Tablets</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-300">
              Premium performance, perfectly refurbished. Get the tech you love at up to 70% off.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop?category=Tablets">
                <Button size="lg" className="px-10 h-14 text-lg font-bold">
                  Shop Now
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <ShieldCheck className="w-5 h-5 text-primary" /> 1Y Warranty
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Truck className="w-5 h-5 text-primary" /> Fast Delivery
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <RotateCcw className="w-5 h-5 text-primary" /> 30D Returns
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Star className="w-5 h-5 text-primary" /> 4.8 Rating
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <img src={heroImg} alt="Featured Product" className="w-full h-auto drop-shadow-2xl animate-float" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
const ContinueShopping = () => {
  const { data: products } = useProducts({ featured: "true" });
  
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Pick up where you left off</h2>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 6).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
const PopularCategories = () => {
  const categories = [
    { name: "Smartphones", icon: Smartphone, href: "/shop?category=Smartphones" },
    { name: "Laptops", icon: Laptop, href: "/shop?category=Laptops" },
    { name: "Tablets", icon: Tablet, href: "/shop?category=Tablets" },
    { name: "Smartwatches", icon: Watch, href: "/shop?category=Smartwatches" },
    { name: "Gaming", icon: Gamepad2, href: "/gaming" },
    { name: "Audio", icon: Headphones, href: "/shop?category=Audio" },
    { name: "Accessories & Bundles", icon: Wrench, href: "/shop?category=Accessories" },
    { name: "Electronics", icon: Monitor, href: "/shop?category=Electronics" },
    { name: "Vacuum Cleaners", icon: Trash2, href: "/shop?category=Vacuums" },
    { name: "Home & Kitchen", icon: Tv, href: "/home-kitchen" },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="bg-background border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:shadow-md transition-all cursor-pointer group">
                <div className="bg-primary/5 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                  <cat.icon className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
const CustomerFavorites = () => {
  const { data: smartphones } = useProducts({ category: "Smartphones" });
  const { data: laptops } = useProducts({ category: "Laptops" });
  const { data: tablets } = useProducts({ category: "Tablets" });
  const { data: audio } = useProducts({ category: "Audio" });
  const { data: home } = useProducts({ category: "Home" });

  const tabs = [
    { id: "smartphones", label: "Smartphones", products: smartphones },
    { id: "laptops", label: "Laptops", products: laptops },
    { id: "tablets", label: "Tablets", products: tablets },
    { id: "audio", label: "Audio", products: audio },
    { id: "home", label: "Home", products: home },
  ];

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Customer Favorites</h2>
        <Tabs defaultValue="smartphones" className="w-full">
          <TabsList className="mb-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {tab.products?.slice(0, 8).map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-12" />
                  <CarouselNext className="-right-12" />
                </div>
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
const TopDeals = () => {
  const { data: deals } = useProducts({ category: "Deals" });
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!deals || deals.length === 0) return null;

  return (
    <section className="py-12 bg-red-50/30 dark:bg-red-950/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold italic text-red-600">Today's Top Deals</h2>
            <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg font-mono font-bold">
              <Timer className="w-4 h-4" />
              <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <Link href="/deals">
            <Button variant="ghost" className="text-red-600 font-bold hover:text-red-700">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {deals.slice(0, 8).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 relative">
                <div className="absolute top-6 left-6 z-10">
                  <Badge className="bg-red-600 hover:bg-red-700 text-white border-none font-bold uppercase tracking-tighter">
                    Top Deal
                  </Badge>
                </div>
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
const TrustBanner = () => {
  return (
    <section className="py-12 bg-teal-50 dark:bg-teal-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-400">Premium Refurbished. Trusted Quality.</h2>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="bg-green-500 p-0.5 rounded-sm">
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="font-bold text-teal-900 dark:text-white">Trustpilot</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { title: "Save up to 70%", icon: Star },
              { title: "12 Months Warranty", icon: ShieldCheck },
              { title: "30-Day Returns", icon: RotateCcw },
              { title: "Quality Checked", icon: Star },
              { title: "Save CO₂ vs new", icon: Star }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <p className="font-bold text-teal-900 dark:text-teal-400 text-sm leading-tight">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
const HomeProducts = () => {
  const { data: products } = useProducts({ category: "Home" });
  
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Home Products</h2>
          <Link href="/home-kitchen">
            <Button variant="ghost" className="text-primary font-bold">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 8).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
const GamingPreview = () => {
  const { data: products } = useProducts({ category: "Gaming" });
  
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Gaming Gear</h2>
          <Link href="/gaming">
            <Button variant="ghost" className="text-primary font-bold">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 6).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
const CircularEconomy = () => {
  return (
    <section className="py-16 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Join the Circular Economy</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              By choosing refurbished, you're not just saving money—you're saving the planet. 
              Every device refurbished is one less device in a landfill. Learn how your purchase 
              reduces e-waste and CO₂ emissions.
            </p>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 font-bold">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden">
              <div className="bg-primary p-4 rounded-full"><ArrowRight className="w-6 h-6" /></div>
            </div>
            <div className="aspect-video bg-slate-900 rounded-2xl border border-white/5"></div>
            <div className="aspect-video bg-slate-900 rounded-2xl border border-white/5"></div>
            <div className="aspect-video bg-slate-900 rounded-2xl border border-white/5"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
const AudioPreview = () => {
  const { data: products } = useProducts({ category: "Audio" });
  
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Audio</h2>
          <Link href="/audio">
            <Button variant="ghost" className="text-primary font-bold">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 6).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useProducts({ featured: "true" });
  const { data: dealProducts, isLoading: dealsLoading } = useProducts({ category: "Deals" });
  const { data: gamingProducts } = useProducts({ category: "Gaming" });
  const { data: homeProducts } = useProducts({ category: "Home" });
  const { data: smartphoneProducts } = useProducts({ category: "Smartphones" });
  const { data: laptopProducts } = useProducts({ category: "Laptops" });
  const { data: tabletProducts } = useProducts({ category: "Tablets" });
  const { data: watchProducts } = useProducts({ category: "Smartwatches" });
  const { data: audioProducts } = useProducts({ category: "Audio" });

  const popularCategories = [
    { name: "Smartphones", icon: Smartphone, href: "/shop?category=Smartphones" },
    { name: "Laptops", icon: Laptop, href: "/shop?category=Laptops" },
    { name: "Tablets", icon: Tablet, href: "/shop?category=Tablets" },
    { name: "Smartwatches", icon: Watch, href: "/shop?category=Smartwatches" },
    { name: "Gaming", icon: Gamepad2, href: "/gaming" },
    { name: "Audio", icon: Headphones, href: "/shop?category=Audio" },
    { name: "Accessories & Bundles", icon: Wrench, href: "/shop?category=Accessories" },
    { name: "Electronics", icon: Monitor, href: "/shop?category=Electronics" },
    { name: "Vacuum Cleaners", icon: Trash2, href: "/shop?category=Vacuums" },
    { name: "Home & Kitchen", icon: Tv, href: "/home-kitchen" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <WhatsAppFloat />

      <HomeHero />
      <ContinueShopping />
      <PopularCategories />
      <CustomerFavorites />
      <TopDeals />
      <TrustBanner />
      <HomeProducts />
      <GamingPreview />
      <CircularEconomy />
      <AudioPreview />

      <Footer />
    </div>
  );
}
