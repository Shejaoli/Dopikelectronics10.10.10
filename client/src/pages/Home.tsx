import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShieldCheck, Truck, HeadphonesIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProducts } from "@/hooks/use-products";
import heroImg from "/images/iphone-17-pro-max-1.png"; // Using provided asset path structure

export default function Home() {
  const { data: products, isLoading } = useProducts({ featured: "true" });

  const features = [
    { icon: ShieldCheck, title: "Genuine Products", desc: "100% Authentic Electronics" },
    { icon: Truck, title: "Fast Delivery", desc: "Kigali & Nationwide" },
    { icon: HeadphonesIcon, title: "Expert Support", desc: "Tech advice available" },
    { icon: Star, title: "Trusted Seller", desc: "4.8/5 Customer Rating" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <WhatsAppFloat />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-24 lg:pb-32 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs lg:text-sm font-bold text-primary">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                PREMIUM REFURBISHED ELECTRONICS
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Premium Electronics <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Perfectly Refurbished</span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-xl text-base lg:text-lg text-muted-foreground">
                Get high-end tech without the high-end price tag. Certified products, expert support, and fast delivery across Rwanda.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <Link href="/shop">
                  <span className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] shadow-lg shadow-primary/20">
                    Explore Shop
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
                <a href="https://wa.me/250783562143" target="_blank" rel="noreferrer">
                  <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-card/50 backdrop-blur-md px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent sm:w-auto">
                    Chat with Experts
                  </span>
                </a>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl filter"></div>
              <img 
                src={heroImg} 
                alt="Latest iPhone" 
                className="relative z-10 w-full drop-shadow-2xl animate-float"
                onError={(e) => {
                   e.currentTarget.src = "https://images.unsplash.com/photo-1592750475338-74b7b21918a4?auto=format&fit=crop&q=80&w=1000"; // Fallback
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y border-border bg-card/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 rounded-full bg-accent p-4 text-primary ring-1 ring-border">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Featured Collections</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked premium electronics just for you.</p>
            </div>
            <Link href="/shop">
              <span className="hidden cursor-pointer items-center text-primary hover:underline sm:flex">
                View all products <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[4/5] rounded-2xl bg-accent animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop">
              <span className="inline-flex cursor-pointer items-center text-primary hover:underline">
                View all products <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-16 shadow-2xl sm:px-12 sm:py-24 md:px-20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/90"></div>
            
            <div className="relative text-center md:text-left md:w-2/3">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Looking for something specific?
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-blue-100">
                We can source specialized electronics upon request. Contact us directly and let us know what you need.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                 <a href="https://wa.me/250783562143" target="_blank" rel="noreferrer" className="rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-900 transition-transform hover:scale-105">
                   Message on WhatsApp
                 </a>
                 <Link href="/contact">
                   <span className="cursor-pointer rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20">
                     Contact Support
                   </span>
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
