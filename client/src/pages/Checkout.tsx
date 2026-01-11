import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, MapPin, Phone, User, CreditCard, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  totalPrice: number;
  quantity: number;
  storage: string;
  color: string;
  imageUrl: string;
}

type CheckoutStep = "shipping" | "payment" | "confirmation";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0 && step !== "confirmation") {
        setLocation("/shop");
      }
      setCart(parsedCart);
    } else if (step !== "confirmation") {
      setLocation("/shop");
    }
  }, [setLocation, step]);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryLocation: "",
      paymentMethod: "Pay on Delivery",
      totalAmount: total || 0,
      status: "pending",
      items: [],
    },
  });

  useEffect(() => {
    if (cart.length > 0) {
      form.setValue("totalAmount", total);
      form.setValue("items", cart.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        storage: item.storage,
        color: item.color
      })));
    }
  }, [total, cart, form]);

  const orderMutation = useMutation({
    mutationFn: async (values: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
      }
      return res.json();
    },
    onSuccess: (order) => {
      setCreatedOrder(order);
      setStep("confirmation");
      localStorage.removeItem("cart");
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message,
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  const nextStep = async () => {
    if (step === "shipping") {
      const isValid = await form.trigger(["customerName", "customerPhone", "deliveryLocation"]);
      if (isValid) setStep("payment");
    }
  };

  const prevStep = () => {
    if (step === "payment") setStep("shipping");
  };

  if (cart.length === 0 && step !== "confirmation") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className={`flex items-center gap-2 ${step === "shipping" ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === "shipping" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>1</span>
              Shipping
            </div>
            <div className="h-px w-8 bg-border" />
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === "payment" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>2</span>
              Payment
            </div>
            <div className="h-px w-8 bg-border" />
            <div className={`flex items-center gap-2 ${step === "confirmation" ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === "confirmation" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>3</span>
              Success
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step !== "confirmation" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-12 lg:grid-cols-2"
            >
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Order Summary
                  </h2>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background p-2">
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between font-semibold">
                              <span className="line-clamp-1">{item.name}</span>
                              <span>{formatPrice(item.totalPrice)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {item.quantity}x • {item.storage} • {item.color}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator className="my-6" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => orderMutation.mutate(data))} className="space-y-6">
                    {step === "shipping" && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Shipping Details</h2>
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Full Name
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} className="h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="0788XXXXXX" {...field} className="h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deliveryLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Address / City
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Kigali, Rwanda..." {...field} value={field.value ?? ""} className="h-12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={nextStep} className="w-full py-7 text-xl font-bold mt-6 shadow-lg shadow-primary/20 hover-elevate active-elevate-2">
                          Continue to Payment <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    )}

                    {step === "payment" && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Payment Method</h2>
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Choose Method
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "Pay on Delivery"}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Pay on Delivery">Pay on Delivery</SelectItem>
                                  <SelectItem value="Pay with WhatsApp">Pay with WhatsApp (Manual)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4 pt-4">
                          <Button type="button" variant="outline" onClick={prevStep} className="flex-1 py-7 text-xl font-bold">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-[2] py-7 text-xl font-bold shadow-lg shadow-primary/20 hover-elevate active-elevate-2"
                            disabled={orderMutation.isPending}
                          >
                            {orderMutation.isPending ? "Processing..." : "Place Order"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="rounded-3xl border border-border bg-card p-12 shadow-xl">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mb-2 text-3xl font-bold">Order Confirmed!</h2>
                <p className="mb-8 text-muted-foreground">
                  Thank you for your purchase. Your order ID is <span className="font-bold text-foreground">#{createdOrder?.id}</span>.
                </p>
                
                <div className="mb-8 text-left space-y-4">
                  <h3 className="font-bold border-b pb-2">Items Purchased</h3>
                  {createdOrder?.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name} {item.storage ? `(${item.storage})` : ""}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-4 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(createdOrder?.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {createdOrder?.paymentMethod === "Pay with WhatsApp" && (
                    <Button 
                      className="w-full py-6 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white"
                      onClick={() => {
                        const message = `Hello DOPIK ELECTRONICS, I just placed order #${createdOrder.id}. Total: ${formatPrice(createdOrder.totalAmount)}. Please confirm my order.`;
                        window.open(`https://wa.me/250783562143?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                    >
                      Confirm via WhatsApp
                    </Button>
                  )}
                  <Link href="/shop">
                    <Button variant="outline" className="w-full py-6 text-lg font-bold">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
