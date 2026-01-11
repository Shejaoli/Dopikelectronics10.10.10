import { useRoute, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Shield, Truck, Share2, ShoppingBag, Minus, Plus as PlusIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ProductDetails() {
  const [match, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: product, isLoading, error } = useProduct(id);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState("256GB");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const storageOptions = [
    { label: "256GB", priceOffset: 0 },
    { label: "512GB", priceOffset: 150000 },
    { label: "1TB", priceOffset: 300000 },
  ];

  const colorOptions = [
    { name: "Silver", value: "#C0C0C0" },
    { name: "Graphite", value: "#383838" },
    { name: "Gold", value: "#D4AF37" },
    { name: "Sierra Blue", value: "#9FB1C3" },
  ];

  const { toast } = useToast();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-primary">Loading...</div>;
  if (error || !product) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
       <p>Product not found.</p>
       <Link href="/shop" className="text-primary hover:underline mt-4">Back to Shop</Link>
    </div>
  );

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: totalPrice / quantity, // Base price with offset but without quantity multiplier
      totalPrice: totalPrice,
      quantity,
      storage: selectedStorage,
      color: selectedColor,
      imageUrl: product.imageUrl,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const currentPriceOffset = storageOptions.find(s => s.label === selectedStorage)?.priceOffset || 0;
  const totalPrice = (product.price + currentPriceOffset) * quantity;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(price);
  };

  const whatsappMessage = `Hello DOPIK ELECTRONICS, I’m interested in buying ${quantity}x ${product.name} (${selectedStorage}${selectedColor ? `, ${selectedColor}` : ""}) priced at ${formatPrice(totalPrice)}. Is it available?`;
  const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(whatsappMessage)}`;

  // Parse specs if they are stored as JSON, otherwise use empty object
  const specs = product.specs as Record<string, string> || {};

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
            
            <div className="mb-6 text-3xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </div>

            {/* Variations */}
            <div className="mb-8 space-y-6">
              {/* Storage Selection */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Storage Capacity</h3>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((option) => (
                    <Button
                      key={option.label}
                      variant={selectedStorage === option.label ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStorage(option.label)}
                      className="rounded-lg font-semibold"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color.name ? "border-primary scale-110 shadow-md" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="mb-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">Technical Specifications</h3>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="border-b border-border pb-2 group transition-colors hover:border-primary/30">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{key}</dt>
                      <dd className="text-sm font-semibold text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-4 pt-6">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">Quantity</span>
                <div className="flex items-center rounded-lg border border-border bg-card p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                onClick={() => setIsCheckoutOpen(true)}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-8 py-6 text-lg font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Buy Now (Direct)
              </Button>
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                className="flex w-full items-center justify-center rounded-xl border-2 border-primary bg-transparent px-8 py-6 text-lg font-bold text-primary transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/5"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noreferrer"
                className="flex w-full items-center justify-center rounded-xl border-2 border-[#25D366] bg-transparent px-8 py-6 text-lg font-bold text-[#25D366] transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-[#25D366]/5"
              >
                Inquire on WhatsApp
              </a>
              <p className="text-center text-xs text-muted-foreground px-4">
                Direct orders will be confirmed via phone call. WhatsApp inquiries are handled by our sales team.
              </p>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal 
              product={{...product, price: totalPrice}} 
              quantity={quantity}
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
