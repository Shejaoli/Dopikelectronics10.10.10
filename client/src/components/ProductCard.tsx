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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Badge */}
      {product.stockStatus === 'out_of_stock' && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
          Sold Out
        </div>
      )}
      {product.isFeatured && product.stockStatus !== 'out_of_stock' && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground backdrop-blur-md">
          Featured
        </div>
      )}

      {/* Image Container */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square cursor-pointer overflow-hidden bg-accent/5 p-6">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Quick Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
             <span className="rounded-full bg-white px-6 py-2 font-medium text-black shadow-lg">View Details</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="mb-2 cursor-pointer text-lg font-bold leading-tight text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground transition-all hover:bg-primary hover:text-primary-foreground group-hover:scale-110"
            title="Order on WhatsApp"
          >
            <ShoppingCart className="h-5 w-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
