import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { CartDrawer } from "./CartDrawer";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Track Order", href: "/track-order" },
    { name: "My Orders", href: "/my-orders" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
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
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span 
                className={`cursor-pointer text-sm font-semibold transition-all hover:text-primary active:scale-95 ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link href="/shop">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-full transition-all active:scale-90">
              <Search className="h-5 w-5" />
            </button>
          </Link>
          <CartDrawer />
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-all active:scale-90"
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
            className="border-b border-white/10 bg-card md:hidden"
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
  );
}
