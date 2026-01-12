import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ChevronRight, CheckCircle2, MessageCircle, Truck, CreditCard as CardIcon, Wallet } from "lucide-react";
import { SiVisa, SiMastercard, SiPaypal } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { insertOrderSchema } from "@shared/schema";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Safe initialization of Stripe
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function CheckoutForm({ 
  cart, 
  shippingData, 
  total, 
  formatPrice, 
  setLocation, 
  setCreatedOrder 
}: { 
  cart: any[], 
  shippingData: any, 
  total: number, 
  formatPrice: (p: number) => string,
  setLocation: (l: string) => void,
  setCreatedOrder: (o: any) => void
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const paymentForm = useForm({
    defaultValues: {
      paymentMethod: "Cash on Delivery",
    },
  });

  const watchPaymentMethod = paymentForm.watch("paymentMethod");

  const orderMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/orders", values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
      }
      return res.json();
    },
    onSuccess: (order, variables) => {
      setCreatedOrder(order);
      if (variables.paymentMethod === "WhatsApp Order Confirmation") {
        const message = `Hello DOPIK ELECTRONICS, my name is ${shippingData?.firstName} ${shippingData?.lastName}. I've placed order #${order.id} via WhatsApp.\n\nItems:\n${cart.map((item: any) => `- ${item.quantity}x ${item.name} (${item.storage}, ${item.color}) - ${formatPrice(item.price)}`).join("\n")}\n\nTotal: ${formatPrice(total)}\n\nShipping Address: ${shippingData?.address}, ${shippingData?.city}, ${shippingData?.province}\nPhone: ${shippingData?.phone}`;
        const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }
      localStorage.removeItem("cart");
      localStorage.removeItem("checkout_shipping");
      setLocation("/order-success");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message,
      });
    },
  });

  const onPaymentSubmit = async (data: any) => {
    if (!shippingData) {
      setLocation("/checkout/shipping");
      return;
    }

    try {
      let paymentStatus = "pending";

      if (data.paymentMethod === "Card Payment") {
        if (!stripe || !elements) {
          throw new Error("Stripe has not loaded yet. Please try again.");
        }

        const res = await apiRequest("POST", "/api/payments/stripe/create-intent", {
          amount: total,
        });
        const { clientSecret } = await res.json();

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found");

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shippingData.firstName} ${shippingData.lastName}`,
              email: shippingData.email,
              phone: shippingData.phone,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.paymentIntent.status === "succeeded") {
          const orderData = {
            customerName: `${shippingData.firstName} ${shippingData.lastName}`,
            customerPhone: shippingData.phone,
            deliveryLocation: `${shippingData.address}, ${shippingData.city}, ${shippingData.province}`,
            paymentMethod: "Card Payment",
            paymentProvider: "stripe",
            paymentReference: result.paymentIntent.id,
            totalAmount: total,
            status: "paid",
            items: cart.map(item => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              storage: item.storage,
              color: item.color
            })),
          };

          const orderRes = await apiRequest("POST", "/api/orders/create", orderData);
          if (!orderRes.ok) throw new Error("Failed to save order");
          const order = await orderRes.json();
          
          setCreatedOrder(order);
          localStorage.removeItem("cart");
          localStorage.removeItem("checkout_shipping");
          setLocation("/order/success");
        }
      }

      const orderData = {
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerPhone: shippingData.phone,
        deliveryLocation: `${shippingData.address}, ${shippingData.city}, ${shippingData.province}`,
        paymentMethod: data.paymentMethod,
        totalAmount: total,
        status: paymentStatus,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          storage: item.storage,
          color: item.color
        })),
      };

      orderMutation.mutate(orderData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: error.message,
      });
    }
  };

  return (
    <Form {...paymentForm}>
      <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Payment</h2>
          <p className="text-sm text-muted-foreground">All transactions are secure and encrypted.</p>
          
          <FormField
            control={paymentForm.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-4"
                  >
                    <FormItem className="flex items-start space-x-4 space-y-0 rounded-2xl border border-border p-6 cursor-pointer hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="Cash on Delivery" className="mt-1" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-bold text-lg flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          Cash on Delivery
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">Pay with cash when your order is delivered to your doorstep.</p>
                      </div>
                    </FormItem>

                    <FormItem className="flex items-start space-x-4 space-y-0 rounded-2xl border border-border p-6 cursor-pointer hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="WhatsApp Order Confirmation" className="mt-1" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-bold text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-[#25D366]" />
                          WhatsApp Order Confirmation
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">Send your order details to us on WhatsApp for manual confirmation and payment instructions.</p>
                      </div>
                    </FormItem>

                    <FormItem className="flex flex-col rounded-2xl border border-border overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors">
                      <div className="flex items-start space-x-4 p-6">
                        <FormControl>
                          <RadioGroupItem value="Card Payment" className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="font-bold text-lg flex items-center gap-2">
                              <CardIcon className="h-5 w-5 text-primary" />
                              Card Payment
                            </FormLabel>
                            <div className="flex gap-2">
                              <SiVisa className="h-5 w-8 text-[#1A1F71]" />
                              <SiMastercard className="h-5 w-8 text-[#EB001B]" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Secure payment using your credit or debit card.</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {watchPaymentMethod === "Card Payment" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-muted/30 border-t border-border"
                          >
                            <div className="p-6">
                              <div className="p-3 bg-background rounded-xl border border-border min-h-[3rem] flex items-center">
                                <CardElement options={{
                                  style: {
                                    base: {
                                      fontSize: '16px',
                                      color: '#424770',
                                      '::placeholder': {
                                        color: '#aab7c4',
                                      },
                                    },
                                    invalid: {
                                      color: '#9e2146',
                                    },
                                  },
                                }} className="w-full" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>

                    <FormItem className="flex flex-col rounded-2xl border border-border overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors">
                      <div className="flex items-start space-x-4 p-6">
                        <FormControl>
                          <RadioGroupItem value="PayPal" className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="font-bold text-lg flex items-center gap-2">
                              <Wallet className="h-5 w-5 text-[#003087]" />
                              PayPal
                            </FormLabel>
                            <SiPaypal className="h-5 w-8 text-[#003087]" />
                          </div>
                          <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your purchase securely.</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {watchPaymentMethod === "PayPal" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-muted/30 border-t border-border"
                          >
                            <div className="p-6">
                              <PayPalScriptProvider options={{ 
                                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
                                currency: "USD",
                                intent: "capture",
                                components: "buttons"
                              }}>
                                <PayPalButtons
                                  style={{ layout: "vertical", shape: "pill" }}
                                  createOrder={async () => {
                                    try {
                                      const response = await apiRequest("POST", "/api/payments/paypal/create-order", {
                                        amount: total,
                                      });
                                      if (!response.ok) {
                                        const error = await response.json();
                                        throw new Error(error.message || "Failed to create PayPal order");
                                      }
                                      const order = await response.json();
                                      return order.id;
                                    } catch (error: any) {
                                      toast({
                                        variant: "destructive",
                                        title: "PayPal Error",
                                        description: error.message,
                                      });
                                      throw error;
                                    }
                                  }}
                                  onApprove={async (data) => {
                                    try {
                                      const response = await apiRequest("POST", "/api/payments/paypal/capture-order", {
                                        orderID: data.orderID,
                                      });
                                      if (!response.ok) {
                                        const error = await response.json();
                                        throw new Error(error.message || "Failed to capture PayPal order");
                                      }
                                      const details = await response.json();
                                      if (details.status === "COMPLETED") {
                                        const orderData = {
                                          customerName: `${shippingData?.firstName} ${shippingData?.lastName}`,
                                          customerPhone: shippingData?.phone,
                                          deliveryLocation: `${shippingData?.address}, ${shippingData?.city}, ${shippingData?.province}`,
                                          paymentMethod: "PayPal",
                                          paymentProvider: "paypal",
                                          paymentReference: data.orderID,
                                          totalAmount: total,
                                          status: "paid",
                                          items: cart.map(item => ({
                                            productId: item.productId,
                                            name: item.name,
                                            quantity: item.quantity,
                                            price: item.price,
                                            storage: item.storage,
                                            color: item.color
                                          })),
                                        };

                                        const orderRes = await apiRequest("POST", "/api/orders/create", orderData);
                                        if (!orderRes.ok) {
                                          const errorData = await orderRes.json();
                                          throw new Error(errorData.message || "Failed to save order");
                                        }
                                        const order = await orderRes.json();

                                        toast({
                                          title: "Payment Successful",
                                          description: "Your payment has been captured and order saved.",
                                        });
                                        
                                        setCreatedOrder(order);
                                        localStorage.removeItem("cart");
                                        localStorage.removeItem("checkout_shipping");
                                        setLocation("/order/success");
                                      }
                                    } catch (error: any) {
                                      toast({
                                        variant: "destructive",
                                        title: "Payment failed",
                                        description: error.message,
                                      });
                                    }
                                  }}
                                  onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    toast({
                                      variant: "destructive",
                                      title: "PayPal Error",
                                      description: "Something went wrong with the PayPal checkout.",
                                    });
                                  }}
                                />
                              </PayPalScriptProvider>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setLocation("/checkout/shipping")}
              className="flex-1 py-7 text-lg font-bold rounded-2xl"
            >
              Back to Shipping
            </Button>
            <Button 
              type="submit" 
              disabled={orderMutation.isPending || (watchPaymentMethod === "Card Payment" && !stripe)}
              className="flex-[2] py-7 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover-elevate active-elevate-2"
            >
              {orderMutation.isPending ? "Processing..." : (watchPaymentMethod === "WhatsApp Order Confirmation" ? "Complete on WhatsApp" : "Pay Now")}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Payments are simulated for demo purposes
          </p>
        </div>
      </form>
    </Form>
  );
}

// Shipping schema
const shippingSchema = z.object({
  email: z.string().email("Invalid email address"),
  updates: z.boolean().default(false),
  country: z.string().default("Rwanda"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Shipping address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province / State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone number is required"),
});

type ShippingForm = z.infer<typeof shippingSchema>;

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
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingData, setShippingData] = useState<ShippingForm | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0 && location !== "/order/success" && location !== "/order-success") {
        setLocation("/shop");
      }
      setCart(parsedCart);
    } else if (location !== "/order/success" && location !== "/order-success") {
      setLocation("/shop");
    }

    const savedShipping = localStorage.getItem("checkout_shipping");
    if (savedShipping) {
      setShippingData(JSON.parse(savedShipping));
    }
  }, [location, setLocation]);

  // Shipping Form
  const shippingForm = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingData || {
      email: "",
      updates: false,
      country: "Rwanda",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
    },
  });

  const onShippingSubmit = (data: ShippingForm) => {
    setShippingData(data);
    localStorage.setItem("checkout_shipping", JSON.stringify(data));
    setLocation("/checkout/payment");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  if (cart.length === 0 && location !== "/order/success" && location !== "/order-success") return null;

  const OrderSummary = () => (
    <div className="lg:sticky lg:top-24 h-fit">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Order Summary
        </h2>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {cart.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-background p-2">
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex justify-between font-bold">
                    <span className="line-clamp-1">{item.name}</span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <span>{item.storage}</span>
                    <span>•</span>
                    <span>{item.color}</span>
                    <span>•</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="my-6" />
        <div className="space-y-3">
          <div className="flex justify-between text-muted-foreground">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="font-medium">Shipping</span>
            <span className="font-bold text-green-500">FREE</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {(location === "/order/success" || location === "/order-success") ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="rounded-3xl border border-border bg-card p-12 shadow-xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-foreground">Order Placed Successfully</h2>
              
              {createdOrder ? (
                <div className="mt-8 space-y-8">
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 text-left">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order ID</p>
                        <p className="text-lg font-bold">#{createdOrder.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Provider</p>
                        <p className="text-lg font-bold uppercase">{createdOrder.paymentProvider || createdOrder.paymentMethod}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Amount</p>
                        <p className="text-lg font-bold text-primary">{formatPrice(createdOrder.totalAmount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Status</p>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-bold">
                          {createdOrder.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      Ordered Items
                    </h3>
                    <div className="rounded-2xl border border-border bg-background/50 overflow-hidden">
                      <div className="divide-y divide-border">
                        {createdOrder.items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 flex justify-between items-center bg-card/50">
                            <div className="space-y-1">
                              <p className="font-bold">{item.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                {item.storage && <span>{item.storage}</span>}
                                {item.storage && item.color && <span>•</span>}
                                {item.color && <span>{item.color}</span>}
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => setLocation("/shop")}
                      className="flex-1 py-6 text-lg font-bold rounded-2xl"
                    >
                      Continue Shopping
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLocation("/track-order")}
                      className="flex-1 py-6 text-lg font-bold rounded-2xl"
                    >
                      Track Order
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <p className="text-muted-foreground mb-8">
                    Thank you for your purchase. Your order is being processed.
                  </p>
                  <Button 
                    onClick={() => setLocation("/shop")}
                    className="w-full py-6 text-lg font-bold rounded-2xl"
                  >
                    Go to Shop
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/cart" className="hover:text-foreground">Cart</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/checkout/shipping" className={`hover:text-foreground ${location === "/checkout/shipping" ? "font-bold text-foreground" : ""}`}>Information</Link>
              <ChevronRight className="h-4 w-4" />
              <span className={location === "/checkout/payment" ? "font-bold text-foreground" : ""}>Payment</span>
            </nav>

            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                {location === "/checkout/shipping" ? (
                  <Form {...shippingForm}>
                    <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-8">
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Contact</h2>
                        <FormField
                          control={shippingForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Email" {...field} className="h-12 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="updates"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">Send me order updates</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Delivery</h2>
                        <FormField
                          control={shippingForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} disabled className="h-12 rounded-xl bg-muted" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={shippingForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="First Name" {...field} className="h-12 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Last Name" {...field} className="h-12 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={shippingForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Shipping Address" {...field} className="h-12 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="apartment"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Apartment / Unit (optional)" {...field} className="h-12 rounded-xl" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 sm:grid-cols-3">
                          <FormField
                            control={shippingForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="City" {...field} className="h-12 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Province" {...field} className="h-12 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingForm.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Postal Code" {...field} className="h-12 rounded-xl" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={shippingForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Phone Number" {...field} className="h-12 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full py-7 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover-elevate active-elevate-2">
                        Continue to Payment
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Elements stripe={stripePromise}>
                    <CheckoutForm 
                      cart={cart}
                      shippingData={shippingData}
                      total={total}
                      formatPrice={formatPrice}
                      setLocation={setLocation}
                      setCreatedOrder={setCreatedOrder}
                    />
                  </Elements>
                )}
              </div>
              <OrderSummary />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
