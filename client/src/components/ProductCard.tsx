import { Link } from "wouter";
import { ShoppingCart, ArrowRight, Star, ShieldCheck } from "lucide-react";
import { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  isDeal?: boolean;
}

export function ProductCard({ product, isDeal }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(price);
  };

  const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(
    `Hello DOPIK, I am interested in buying ${product.name} for ${formatPrice(product.price)}`
  )}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
    >
      {/* Badges */}
      <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
        {isDeal && (
          <div className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
            Save 40%
          </div>
        )}
        {product.stockStatus === 'out_of_stock' && (
          <div className="rounded-full bg-red-500 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm">
            Sold Out
          </div>
        )}
      </div>

      {product.isFeatured && product.stockStatus !== 'out_of_stock' && (
        <div className="absolute right-2.5 top-2.5 z-10">
          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary backdrop-blur-md border border-primary/20">
            Featured
          </div>
        </div>
      )}

      {/* Image Container */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square cursor-pointer overflow-hidden bg-accent/5 p-3">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Quick Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
             <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-black shadow-lg ring-1 ring-black/5">View Details</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 group/content">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-primary/70">
            {product.brand}
          </span>
          <div className="flex items-center gap-0.5">
            <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
            <span className="text-[8px] font-bold text-muted-foreground">4.8</span>
          </div>
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 cursor-pointer text-sm font-bold leading-tight text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground/80">
            <span className="rounded-sm bg-muted px-1 py-0.5 text-[8px] font-bold text-foreground">Grade A</span>
            <span>Refurbished • Like New</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>12-Month Warranty</span>
          </div>
        </div>
        
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {isDeal && (
              <span className="text-[9px] font-medium text-muted-foreground/60 line-through">{(product.price * 1.4).toLocaleString()} RWF</span>
            )}
            <div className="text-base font-black tracking-tight text-foreground">
              {formatPrice(product.price)}
            </div>
          </div>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95"
            title="Order on WhatsApp"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
