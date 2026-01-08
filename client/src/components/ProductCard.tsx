import { Link } from "wouter";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
    >
      {/* Badge */}
      {product.stockStatus === 'out_of_stock' && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          Sold Out
        </div>
      )}
      {product.isFeatured && product.stockStatus !== 'out_of_stock' && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md">
          Featured
        </div>
      )}

      {/* Image Container */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-accent/5 p-6">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Quick Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
             <span className="rounded-full bg-white/90 backdrop-blur-md px-6 py-2 text-sm font-semibold text-black shadow-xl ring-1 ring-black/5">Quick View</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary/80">
          {product.brand}
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 cursor-pointer text-lg font-bold leading-tight text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatPrice(product.price)}
          </div>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95"
            title="Order on WhatsApp"
          >
            <ShoppingCart className="h-5 w-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
