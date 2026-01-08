import { useRoute, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ArrowLeft, Check, Shield, Truck, Share2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ProductDetails() {
  const [match, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: product, isLoading, error } = useProduct(id);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-primary">Loading...</div>;
  if (error || !product) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
       <p>Product not found.</p>
       <Link href="/shop" className="text-primary hover:underline mt-4">Back to Shop</Link>
    </div>
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(price);
  };

  const whatsappMessage = `Hello DOPIK ELECTRONICS, I’m interested in buying the ${product.name} priced at ${formatPrice(product.price)}. Is it available?`;
  const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(whatsappMessage)}`;

  // Parse specs if they are stored as JSON, otherwise use placeholder
  const specs = product.specs as Record<string, string> || { "Warranty": "1 Year", "Condition": "Brand New" };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <WhatsAppFloat />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/shop">
          <span className="mb-8 inline-flex cursor-pointer items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </span>
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square overflow-hidden rounded-3xl border border-border bg-card p-8">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="h-full w-full object-contain"
              />
            </div>
            {/* Additional images grid would go here */}
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-2 inline-flex items-center gap-2">
               <span className="text-sm font-bold uppercase tracking-wider text-primary">{product.brand}</span>
               {product.stockStatus === 'in_stock' && (
                 <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">In Stock</span>
               )}
            </div>
            
            <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{product.name}</h1>
            
            <div className="mb-8 text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Specs */}
            <div className="mb-8 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-bold uppercase text-foreground">Technical Specifications</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="border-b border-border pb-2">
                    <dt className="text-xs text-muted-foreground">{key}</dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-4">
              <Button 
                onClick={() => setIsCheckoutOpen(true)}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] shadow-lg shadow-primary/20"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Buy Now (Direct)
              </Button>
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noreferrer"
                className="flex w-full items-center justify-center rounded-xl border-2 border-[#25D366] bg-transparent px-8 py-4 text-lg font-bold text-[#25D366] transition-transform hover:scale-[1.02] hover:bg-[#25D366]/5"
              >
                Inquire on WhatsApp
              </a>
              <p className="text-center text-xs text-muted-foreground">
                Direct orders will be confirmed via phone call. WhatsApp inquiries are handled by our sales team.
              </p>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal 
              product={product} 
              open={isCheckoutOpen} 
              onOpenChange={setIsCheckoutOpen} 
            />

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div className="flex flex-col items-center text-center">
                <Shield className="mb-2 h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-foreground">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck className="mb-2 h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Check className="mb-2 h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-foreground">Genuine Product</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
