import { useRoute, Link, useLocation } from "wouter";
import { useProduct, useProducts } from "@/hooks/use-products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Shield, Truck, Share2, ShoppingBag, Minus, Plus as PlusIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProductDetails() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const id = params ? parseInt(params.id) : 0;
  const { data: product, isLoading, error } = useProduct(id);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Variations and Stock Handling
  const variations = product?.variations as {
    storage?: { option: string; priceOffset: number; stock?: number }[];
    colors?: { name: string; value: string; stock?: number }[];
  } || {};

  const storageOptions = variations.storage || [];
  const colorOptions = variations.colors || [];

  const [selectedImage, setSelectedImage] = useState(product?.imageUrl || "");
  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0]?.option || "");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]?.name || "");
  const [quantity, setQuantity] = useState(1);

  // Re-sync variations when product changes
  useEffect(() => {
    if (product) {
      const v = product.variations as any || {};
      const s = v.storage || [];
      const c = v.colors || [];
      setSelectedStorage(s[0]?.option || "");
      setSelectedColor(c[0]?.name || "");
    }
  }, [product]);

  // Update selected image when product changes
  useEffect(() => {
    if (product?.imageUrl) {
      setSelectedImage(product.imageUrl);

      // Update recently viewed
      const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as number[];
      const updatedViewed = [product.id, ...viewedIds.filter(id => id !== product.id)].slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(updatedViewed));
      window.dispatchEvent(new Event("storage"));
    }
  }, [product]);

  const { toast } = useToast();

  const { data: relatedProducts, isLoading: isLoadingRelated } = useProducts({ category: product?.category });
  const recommendations = relatedProducts?.filter(p => p.id !== product?.id).slice(0, 4) || [];

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background text-primary">Loading...</div>;
  if (error || !product) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
       <p>Product not found.</p>
       <Link href="/shop" className="text-primary hover:underline mt-4">Back to Shop</Link>
    </div>
  );

  const currentStorage = storageOptions.find(s => s.option === selectedStorage);
  const currentColor = colorOptions.find(c => c.name === selectedColor);

  const isOutOfStock = (currentStorage?.stock === 0) || (currentColor?.stock === 0);
  const maxStock = Math.min(currentStorage?.stock ?? 99, currentColor?.stock ?? 99);


  const handleAddToCart = () => {
    const currentPriceOffset = currentStorage?.priceOffset || 0;
    const itemTotalPrice = (product.price + currentPriceOffset) * quantity;

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: itemTotalPrice / quantity,
      totalPrice: itemTotalPrice,
      quantity,
      storage: selectedStorage,
      color: selectedColor,
      imageUrl: product.imageUrl,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update recently viewed
    const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as number[];
    const updatedViewed = [product.id, ...viewedIds.filter(id => id !== product.id)].slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(updatedViewed));

    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });

    setLocation("/cart");
  };

  const currentPriceOffset = currentStorage?.priceOffset || 0;
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

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row gap-4 md:sticky top-8"
          >
            {/* Thumbnails */}
            <div className="flex flex-row md:flex-col gap-2 md:gap-4 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {[product.imageUrl, ...(product.additionalImages || [])].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedImage === img ? "border-primary shadow-md" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 aspect-square overflow-hidden rounded-3xl border border-border bg-card p-4 md:p-8 order-1 md:order-2 relative group">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={selectedImage} 
                alt={product.name} 
                className="h-full w-full object-contain"
              />
              {/* Zoom or Fullscreen indicator could go here */}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-2 inline-flex items-center gap-2">
               <span className="text-sm font-bold uppercase tracking-wider text-primary">{product.brand}</span>
               {isOutOfStock ? (
                 <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Out of Stock</span>
               ) : product.stockStatus === 'in_stock' && (
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
              {product.category === "Smartphones" && storageOptions.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Storage Capacity</h3>
                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map((option) => (
                      <Button
                        key={option.option}
                        variant={selectedStorage === option.option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStorage(option.option)}
                        className={`rounded-lg font-semibold ${option.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={option.stock === 0}
                      >
                        {option.option}
                        {option.stock === 0 && <span className="ml-2 text-[10px] opacity-70">(Out)</span>}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.category === "Smartphones" && colorOptions.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        disabled={color.stock === 0}
                        className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedColor === color.name ? "border-primary scale-110 shadow-md" : "border-transparent"
                        } ${color.stock === 0 ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                        style={{ backgroundColor: color.value }}
                        title={color.stock === 0 ? `${color.name} (Out of Stock)` : color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Laptop Specs */}
            {product.category === "Laptops" && specs && Object.keys(specs).length > 0 && (
              <div className="mb-8 rounded-2xl border border-border bg-primary/5 p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">Laptop Configuration</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-sm font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specs (General) */}
            {product.category !== "Laptops" && Object.keys(specs).length > 0 && (
              <div className="mb-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 overflow-hidden">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">Technical Specifications</h3>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="border-b border-border pb-2 group transition-colors hover:border-primary/30 overflow-hidden">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 truncate">{key}</dt>
                      <dd className="text-sm font-semibold text-foreground break-words">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-4 pt-6">
              {isOutOfStock && (
                <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm font-semibold text-destructive">
                  This combination is currently out of stock.
                </div>
              )}
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
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock || isOutOfStock}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                onClick={() => setIsCheckoutOpen(true)}
                disabled={isOutOfStock}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-8 py-6 text-lg font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Buy Now (Direct)"}
              </Button>
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                disabled={isOutOfStock}
                className="flex w-full items-center justify-center rounded-xl border-2 border-primary bg-transparent px-8 py-6 text-lg font-bold text-primary transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/5 disabled:opacity-50 disabled:hover:scale-100"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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

            {/* FAQ Section */}
            <div className="mt-12 border-t border-border pt-12">
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">Is this product brand new?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    We offer both brand new and certified refurbished electronics. Refurbished items undergo rigorous testing and are restored to like-new condition with genuine parts. Check the product specifications for individual item condition.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">Does it have warranty?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Yes, all our electronics come with a 1-year limited warranty covering hardware defects. Our dedicated service center in Kigali handles all warranty claims promptly.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">How long does delivery take?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Delivery within Kigali typically takes 2-4 hours. For orders outside Kigali, delivery takes 24-48 hours depending on your location.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">Can I pay on delivery?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Yes, we support Cash on Delivery and Momo Pay on Delivery for all orders within Kigali. For orders outside Kigali, we require payment before shipping.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">You May Also Like</h2>
                <p className="text-sm text-muted-foreground mt-1">Customers who viewed this also considered these items</p>
              </div>
              <Link href="/shop">
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}