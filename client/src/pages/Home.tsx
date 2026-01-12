import { Link } from "wouter";
import { motion } from "framer-motion";
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

const HomeHero = () => null;
const ContinueShopping = () => null;
const PopularCategories = () => null;
const CustomerFavorites = () => null;
const TopDeals = () => null;
const TrustBanner = () => null;
const HomeProducts = () => null;
const GamingPreview = () => null;
const CircularEconomy = () => null;
const AudioPreview = () => null;

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

      {/* Hero Section */}
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

      {/* Popular Categories */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {popularCategories.map((cat) => (
              <Link key={cat.name} href={cat.href}>
                <div className="bg-background border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:shadow-lg transition-all cursor-pointer group">
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

      {/* Today's Top Deals */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Today's Top Deals</h2>
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
                <Timer className="w-4 h-4" /> 23:59:59
              </div>
            </div>
            <Link href="/deals" className="text-primary font-bold hover:underline flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {dealProducts?.map((product) => (
                <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Mid-Page Trust Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-teal-50 dark:bg-teal-950/20 rounded-3xl p-10 border border-teal-100 dark:border-teal-900/30 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 space-y-4 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-400 leading-tight">Premium Refurbished. Trusted Quality.</h2>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="bg-green-500 p-1 rounded-sm">
                <Star className="w-4 h-4 fill-white text-white" />
              </div>
              <span className="font-black tracking-tighter text-teal-900 dark:text-white text-xl">Trustpilot</span>
            </div>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Save up to 70%", desc: "Vs brand new price" },
              { title: "12 Months Warranty", desc: "On every purchase" },
              { title: "Quality Tested", desc: "By our expert technicians" },
              { title: "Risk-free 30-Day Trial", desc: "No questions asked" },
              { title: "Save CO₂ vs new", desc: "Choose sustainable" }
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <p className="font-bold text-teal-900 dark:text-teal-400 text-lg">{item.title}</p>
                <p className="text-teal-700 dark:text-teal-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Favorites Tab Section */}
      <section className="py-16 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Customer Favorites</h2>
          <Tabs defaultValue="smartphones" className="w-full">
            <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 mb-8 gap-8 overflow-x-auto overflow-y-hidden">
              {["Smartphones", "Laptops", "Tablets", "Smartwatches", "Audio", "Home"].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase()} 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-4 text-lg font-bold"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {[
              { id: "smartphones", data: smartphoneProducts, href: "/shop?category=Smartphones" },
              { id: "laptops", data: laptopProducts, href: "/shop?category=Laptops" },
              { id: "tablets", data: tabletProducts, href: "/shop?category=Tablets" },
              { id: "smartwatches", data: watchProducts, href: "/shop?category=Smartwatches" },
              { id: "audio", data: audioProducts, href: "/shop?category=Audio" },
              { id: "home", data: homeProducts, href: "/home-kitchen" },
            ].map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <Carousel className="w-full">
                  <CarouselContent className="-ml-4">
                    {tab.data?.map((product) => (
                      <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center mt-8">
                    <Link href={tab.href}>
                      <Button variant="outline" className="font-bold">See all {tab.id}</Button>
                    </Link>
                  </div>
                </Carousel>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Gaming Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Gaming Gear</h2>
            <Link href="/gaming" className="text-primary font-bold hover:underline flex items-center gap-1">
              See all gaming <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {gamingProducts?.map((product) => (
                <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Join the Circular Economy */}
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

      <Footer />
    </div>
  );
}
