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
import { ShoppingBag, MapPin, Phone, User, CreditCard } from "lucide-react";

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

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setLocation("/shop");
    }
  }, [setLocation]);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryLocation: "",
      paymentMethod: "Cash on Delivery",
      totalAmount: total || 0,
      status: "pending",
      items: (cart || []).map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        storage: item.storage,
        color: item.color
      })),
    },
  });

  // Update totalAmount and items when cart or total changes
  useEffect(() => {
    form.setValue("totalAmount", total);
    form.setValue("items", cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      storage: item.storage,
      color: item.color
    })));
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
      toast({
        title: "Order placed successfully!",
        description: "Redirecting to WhatsApp for confirmation...",
      });
      
      const message = `Hello DOPIK ELECTRONICS, my name is ${order.customerName}. I have placed an order for:\n${cart.map(item => `- ${item.quantity}x ${item.name} (${item.storage}, ${item.color})`).join("\n")}\n\nDelivery Location: ${order.deliveryLocation}\nPayment Method: ${order.paymentMethod}\nTotal Amount: ${total} RWF\nOrder ID: #${order.id}.\n\nThank you.`;
      const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(message)}`;
      
      localStorage.removeItem("cart");
      
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        setLocation("/");
      }, 1000);
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

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Order Summary */}
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

          {/* Checkout Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">Shipping & Payment</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => orderMutation.mutate(data))} className="space-y-4">
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
                        <MapPin className="h-4 w-4" /> Delivery Location
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Kigali, Rwanda..." {...field} value={field.value ?? ""} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payment Method
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "Cash on Delivery"}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                          <SelectItem value="Momo Pay">Momo Pay</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full py-7 text-xl font-bold mt-6 shadow-lg shadow-primary/20 hover-elevate active-elevate-2"
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending ? "Processing..." : "Complete Order"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
