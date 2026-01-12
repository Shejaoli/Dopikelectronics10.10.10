import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search, HelpCircle, Info, User, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { CartDrawer } from "./CartDrawer";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { name: "All Items", href: "/shop" },
    { name: "Deals 🔥", href: "/shop?deals=true" },
    { name: "iPhones", href: "/shop?brand=Apple&category=Smartphones" },
    { name: "Samsung Phones", href: "/shop?brand=Samsung&category=Smartphones" },
    { name: "Laptops", href: "/shop?category=Laptops" },
    { name: "Electronics", href: "/shop?category=Electronics" },
    { name: "Home", href: "/shop?category=Home" },
    { name: "Tools", href: "/shop?category=Tools" },
    { name: "Gaming", href: "/shop?category=Gaming" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Utility Bar */}
      <div className="hidden border-b border-border bg-muted/30 lg:block">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left - Placeholder for alignment */}
          <div className="w-48"></div>

          {/* Center - Search */}
          <div className="flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by model, color, brand..."
                className="h-9 w-full rounded-full border border-border bg-background pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Right - Location & Icons */}
          <div className="flex w-auto items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Deliver to: Kigali, Rwanda</span>
            </div>
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <Link href="/contact" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden xl:inline">Help</span>
              </Link>
              <Link href="/about" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
                <Info className="h-4 w-4" />
                <span className="hidden xl:inline">About</span>
              </Link>
              <Link href="/admin/login" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
                <User className="h-4 w-4" />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
              <CartDrawer />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
             {/* Fallback to text if image fails, but instructions say use /images/logo.png */}
            <div className="relative h-8 w-auto overflow-hidden">
               <img src="/images/logo.png" alt="DOPIK" className="h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
               <span className="text-xl font-bold tracking-tighter text-foreground sm:hidden md:hidden lg:hidden">DOPIK</span>
            </div>
            <span className="hidden text-xl font-bold tracking-tighter text-foreground sm:block">
              DOPIK <span className="text-primary">ELECTRONICS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden flex-1 justify-center px-4 lg:flex">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <span 
                    className={`cursor-pointer text-sm font-semibold transition-all hover:text-primary active:scale-95 whitespace-nowrap ${
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions (Mobile Search & Theme) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/shop" className="lg:hidden">
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-full transition-all active:scale-90">
                <Search className="h-5 w-5" />
              </button>
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-all active:scale-90"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-white/10 bg-card lg:hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div 
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        isActive(link.href) 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
