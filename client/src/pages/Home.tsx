import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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
  Timer,
  Volume2,
  VolumeX,
  Check,
  MapPin
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

// Import images
import banner1 from "@assets/stock_images/high_quality_banner__3cb20b92.jpg";
import banner2 from "@assets/stock_images/high_quality_banner__880fc6d2.jpg";
import banner3 from "@assets/stock_images/high_quality_banner__b1407c03.jpg";

// Category Images
import smartphonesCat from "@assets/Phone_category_1768723350746.png";
import laptopsCat from "@assets/Laptop_category_1768723909466.png";
import tabletsCat from "@assets/tablet_category_1768724210189.png";
import watchesCat from "@assets/smartwatches_category_1768746560605.png";
import gamingCat from "@assets/Gaming_category_1768746932352.png";
import audioCat from "@assets/Audio_category_1768748035466.png";
import accessoriesCat from "@assets/Accessoirs_category_1768748494801.png";
import electronicsCat from "@assets/Electronics_category_1768749381858.png";

// Custom Assets for First Slide
import controllerImg from "@assets/32497_1_1768720576552.png";
import phoneImg from "@assets/Apple-iPhone-15-Pro-vs-Samsung-Galaxy-S23-Ultra-cameras_1768720576555.png";
import macbookImg from "@assets/apple-macbook-air-15in-m4_1768720576555.png";

const HomeHero = () => {
  const slides = [
    {
      isFirst: true,
      title: "Certified Electronic Shop",
      subtitle: "in Rwanda",
      buttonText: "Shop Deals",
      buttonHref: "/deals",
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-950",
    },
    {
      title: "Refurbished iPads & Tablets",
      subtitle: "On the go or on the fly.",
      buttonText: "Shop Now",
      buttonHref: "/shop?category=Tablets",
      image: banner2,
      bgColor: "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900",
      textColor: "text-white",
    },
    {
      title: "Smartwatches for Everyone",
      subtitle: "Stay connected, stay healthy.",
      buttonText: "Explore More",
      buttonHref: "/shop?category=Smartwatches",
      image: banner3,
      bgColor: "bg-blue-100",
      textColor: "text-blue-950",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="h-[250px] lg:h-[300px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${slide.bgColor} ${slide.textColor}`}>
              {slide.isFirst ? (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full h-full relative flex items-center justify-center">
                  {/* Macbook - Left Side */}
                  <div className="absolute left-[-5%] lg:left-0 bottom-[-10%] lg:bottom-[-5%] w-[35%] lg:w-[30%] z-10 rotate-[-5deg]">
                    <img src={macbookImg} alt="Macbook" className="w-full h-auto object-contain" />
                  </div>

                  {/* Phone - Bottom Center-ish but slightly left of center */}
                  <div className="absolute left-[20%] lg:left-[25%] bottom-[-5%] w-[25%] lg:w-[22%] z-10">
                    <img src={phoneImg} alt="Phones" className="w-full h-auto object-contain" />
                  </div>
                  
                  {/* Content Container - Centered */}
                  <div className="relative z-20 space-y-4 text-center px-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="text-base text-muted-foreground/80 max-w-lg mx-auto hidden sm:block">
                      {slide.subtitle}
                    </p>
                    
                    <Link href={slide.buttonHref}>
                      <Button size="sm" className="rounded-full px-8 h-10 text-base font-bold mt-2">
                        {slide.buttonText}
                      </Button>
                    </Link>
                  </div>

                  {/* Controller - Far Right Bottom/Side */}
                  <div className="absolute right-[-10%] lg:right-[-5%] bottom-[-15%] w-[40%] lg:w-[35%] z-10 rotate-[10deg]">
                    <img src={controllerImg} alt="Controller" className="w-full h-auto object-contain" />
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center w-full h-full text-[#010033]">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-[#9cbbe5]">
                      {slide.title}
                    </h1>
                    <p className="text-base text-muted-foreground/80 max-w-lg hidden sm:block text-[#b0d2ff]">
                      {slide.subtitle}
                    </p>
                    <Link href={slide.buttonHref}>
                      <Button size="sm" className="rounded-full px-8 h-10 text-base font-bold">
                        {slide.buttonText}
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden lg:flex justify-end relative">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="max-h-[220px] lg:max-h-[280px] object-contain drop-shadow-2xl" 
                    />
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Trust Bar */}
      <div className="bg-white dark:bg-slate-900 border-b py-6 relative z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 items-center justify-items-center">
            <div className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none mb-1">12-Month Warranty</span>
                <span className="text-[10px] text-muted-foreground/70">Genuine protection</span>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none mb-1">Quality Checked</span>
                <span className="text-[10px] text-muted-foreground/70">Rigorously tested</span>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none mb-1">Kigali Support</span>
                <span className="text-[10px] text-muted-foreground/70">Local expert help</span>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-600 transition-transform group-hover:scale-110">
                <Star className="w-5 h-5 fill-yellow-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none mb-1">4.7 Google Reviews</span>
                <span className="text-[10px] text-muted-foreground/70">Trusted by thousands</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
const RecommendedProducts = () => {
  const { data: allProducts } = useProducts();
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [recommendationReason, setRecommendationReason] = useState<string | null>(null);

  useEffect(() => {
    const viewedIdsStr = localStorage.getItem("recentlyViewed");
    if (viewedIdsStr && allProducts) {
      const viewedIds = JSON.parse(viewedIdsStr) as number[];
      // Get the 6 most recent unique products
      const products = viewedIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 6);
      
      setRecentlyViewed(products);
      
      if (products.length > 0) {
        setRecommendationReason(`Because you viewed ${products[0].name}`);
      }
    }
  }, [allProducts]);

  // Fallback to "Popular in Kigali" (Featured) or "Best Value" (Deals)
  const displayProducts = recentlyViewed.length > 0 
    ? recentlyViewed 
    : allProducts?.filter(p => p.isFeatured || p.category === "Deals").slice(0, 6) || [];

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-12 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-8">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          {recommendationReason && recentlyViewed.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium italic">
              <RotateCcw className="w-3 h-3 text-primary" /> {recommendationReason}
            </p>
          )}
          {!recommendationReason && (
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">
              Popular in Kigali • Best value today
            </p>
          )}
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {displayProducts.map((product) => (
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
    { name: "Smartphones", image: smartphonesCat, href: "/shop?category=Smartphones", description: "New & Refurbished" },
    { name: "Laptops", image: laptopsCat, href: "/shop?category=Laptops", description: "Power & Portability" },
    { name: "Tablets", image: tabletsCat, href: "/shop?category=Tablets", description: "On the go or on the fly" },
    { name: "Smartwatches", image: watchesCat, href: "/shop?category=Smartwatches", description: "Stay connected" },
    { name: "Gaming", image: gamingCat, href: "/gaming", description: "Consoles & Controllers" },
    { name: "Audio", image: audioCat, href: "/shop?category=Audio", description: "Immersive Sound" },
    { name: "Accessories", image: accessoriesCat, href: "/shop?category=Accessories", description: "Bundles & Gear" },
    { name: "Electronics", image: electronicsCat, href: "/shop?category=Electronics", description: "Premium Tech" },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-transparent to-muted/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="flex flex-col items-center justify-center gap-4 text-center cursor-pointer group p-4 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-primary/10">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-contain z-10 drop-shadow-md group-hover:drop-shadow-xl" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-cyan-100/30 flex items-center justify-center group-hover:bg-cyan-100/50 transition-colors">
                      {(cat as any).icon && (
                        <div className="w-10 h-10 text-primary/70">
                          {(cat as any).icon}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                  <span className="block text-[10px] font-medium text-muted-foreground/80 line-clamp-1">{cat.description}</span>
                </div>
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
    <section className="py-16 bg-gradient-to-b from-red-50/20 to-transparent dark:from-red-950/5 dark:to-transparent">
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
    <section className="py-16 bg-gradient-to-b from-teal-50/30 to-transparent dark:from-teal-950/10 dark:to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-400">Premium Refurbished. Trusted Quality.</h2>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="bg-green-500 p-0.5 rounded-sm">
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="font-bold text-teal-900 dark:text-white">Google Reviews</span>
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
export const CircularEconomy = () => {
  const { data: dbVideos, isLoading } = useQuery<any[]>({
    queryKey: ["/api/videos"]
  });

  const activeDbVideos = dbVideos?.filter(v => v.isActive) || [];
  
  // Prioritize featured videos if they exist
  const featuredVideos = activeDbVideos.filter(v => v.isFeatured);
  const displayVideos = featuredVideos.length >= 2 
    ? featuredVideos 
    : [...featuredVideos, ...activeDbVideos.filter(v => !v.isFeatured)].slice(0, 2);

  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideo, setActiveVideo] = useState(1);

  // Use display videos if available, fallback to defaults
  const video1Url = displayVideos?.[0]?.url || "/videos/economy.mp4";
  const video2Url = displayVideos?.[1]?.url || "/videos/iphone17.mp4";

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (activeVideo === 1) {
            videoRef1.current?.play().catch(() => {});
          } else {
            videoRef2.current?.play().catch(() => {});
          }
        } else {
          videoRef1.current?.pause();
          videoRef2.current?.pause();
        }
      });
    }, options);

    const currentRef = activeVideo === 1 ? videoRef1.current : videoRef2.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (videoRef1.current) observer.unobserve(videoRef1.current);
      if (videoRef2.current) observer.unobserve(videoRef2.current);
    };
  }, [activeVideo, displayVideos]);

  const handleVideo1End = () => {
    if (displayVideos && displayVideos.length > 1) {
      setActiveVideo(2);
      setTimeout(() => {
        videoRef2.current?.play().catch(() => {});
      }, 100);
    } else {
      videoRef1.current?.play().catch(() => {});
    }
  };

  const handleVideo2End = () => {
    setActiveVideo(1);
    setTimeout(() => {
      videoRef1.current?.play().catch(() => {});
    }, 100);
  };

  if (isLoading) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-6/12 lg:w-7/12 space-y-6">
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
          <div className="md:w-6/12 lg:w-5/12 flex justify-center gap-4">
            {/* Video 1 */}
            <div className={`relative group w-full max-w-[240px] transition-all duration-500 ${activeVideo === 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}>
              <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${activeVideo === 1 ? 'opacity-40' : 'opacity-0'}`}></div>
              <div className="relative bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl aspect-[4/5]">
                <video 
                  ref={videoRef1}
                  src={video1Url} 
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideo1End}
                  className="w-full h-full object-cover block cursor-pointer"
                  onClick={() => {
                    setActiveVideo(1);
                    videoRef2.current?.pause();
                    videoRef1.current?.play().catch(() => {});
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                {activeVideo === 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-4 right-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white z-20 transition-all hover:scale-110 active:scale-95 shadow-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                )}
              </div>
            </div>

            {/* Video 2 (Only show if we have a second video or are using default) */}
            {(activeDbVideos?.length !== 1) && (
              <div className={`relative group w-full max-w-[240px] transition-all duration-500 ${activeVideo === 2 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}>
                <div className={`absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${activeVideo === 2 ? 'opacity-40' : 'opacity-0'}`}></div>
                <div className="relative bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl aspect-[4/5]">
                  <video 
                    ref={videoRef2}
                    src={video2Url} 
                    muted={isMuted}
                    playsInline
                    onEnded={handleVideo2End}
                    className="w-full h-full object-cover block cursor-pointer"
                    onClick={() => {
                      setActiveVideo(2);
                      videoRef1.current?.pause();
                      videoRef2.current?.play().catch(() => {});
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {activeVideo === 2 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-4 right-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white z-20 transition-all hover:scale-110 active:scale-95 shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  )}
                </div>
              </div>
            )}
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
      <RecommendedProducts />
      <PopularCategories />
      <CustomerFavorites />
      <TopDeals />
      <HomeProducts />
      <GamingPreview />
      <CircularEconomy />
      <AudioPreview />

      <Footer />
    </div>
  );
}
