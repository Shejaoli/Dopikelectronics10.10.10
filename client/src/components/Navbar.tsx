import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Search, HelpCircle, Info, User, MapPin, ChevronRight, Flame, Smartphone, Laptop, Tablet, Watch, Gamepad2, Wrench, Home as HomeIcon, Smartphone as ElectronicsIcon, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { name: "All Items", onClick: () => setIsMenuOpen(true) },
    { name: "Deals ??", href: "/deals" },
    { name: "iPhones", href: "/iphones" },
    { name: "Laptops", href: "/laptops" },
    { name: "Electronics", href: "/electronics" },
    { name: "Samsung Phones", href: "/shop?brand=Samsung&category=Smartphones" },
    { name: "Home", href: "/home-kitchen" },
    { name: "Tools", href: "/tools-home-improvement" },
    { name: "Gaming", href: "/gaming" },
  ];

  const isActive = (path: string) => location === path;

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="DOPIK" className="h-6 object-contain" />
                    <span className="font-bold tracking-tighter">DOPIK</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 p-4 space-y-8">
                  {/* Section 1: Promo */}
                  <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Flame className="h-5 w-5" />
                      <span className="font-bold">Hot Deals</span>
                    </div>
                    <Link href="/shop?deals=true" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-between group">
                        Browse Deals
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Section 2: Trending */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Trending</h3>
                    <div className="space-y-1">
                      {[
                        { name: "Smartphones", icon: Smartphone, href: "/smartphones" },
                        { name: "Laptops", icon: Laptop, href: "/laptops" },
                        { name: "Tablets", icon: Tablet, href: "/tablets" },
                        { name: "Smartwatches", icon: Watch, href: "/smartwatches" },
                      ].map((item) => (
                        <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Shop by Department */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Shop by Department</h3>
                    <div className="space-y-1">
                      {[
                        { name: "Electronics", icon: ElectronicsIcon, href: "/electronics" },
                        { name: "Home & Kitchen", icon: HomeIcon, href: "/home-kitchen" },
                        { name: "Gaming", icon: Gamepad2, href: "/gaming" },
                        { name: "Tools", icon: Wrench, href: "/tools-home-improvement" },
                        { name: "Others", icon: Layers, href: "/shop" },
                      ].map((item) => (
                        <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Help & Settings */}
                  <div className="pt-4 border-t">
                    <div className="space-y-1">
                      <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Help</span>
                        </div>
                      </Link>
                      <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Sign In</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  <div className="flex items-center gap-4 border-l border-border pl-6">
              <Link href="/contact" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 hover:text-primary">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden xl:inline">Help</span>
              </Link>
              <Link href="/about" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 hover:text-primary">
                <Info className="h-4 w-4" />
                <span className="hidden xl:inline">About</span>
              </Link>
              <Link href="/admin/login" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 hover:text-primary">
                <User className="h-4 w-4" />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
              <CartDrawer />
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
                link.onClick ? (
                  <button
                    key={link.name}
                    onClick={link.onClick}
                    className="cursor-pointer text-sm font-semibold transition-all hover:text-primary active:scale-95 whitespace-nowrap text-muted-foreground"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link key={link.name} href={link.href}>
                    <span 
                      className={`cursor-pointer text-sm font-semibold transition-all hover:text-primary active:scale-95 whitespace-nowrap ${
                        isActive(link.href) ? "text-primary" : "text-muted-foreground/80"
                      }`}
                    >
                      {link.name}
                    </span>
                  </Link>
                )
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
                  <Link key={link.href || link.name} href={link.href || "#"}>
                    <div 
                      className={`block rounded-lg px-3 py-2 text-base font-medium ${
                        link.href && isActive(link.href) 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                      onClick={() => {
                        if (link.onClick) link.onClick();
                        setIsOpen(false);
                      }}
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
