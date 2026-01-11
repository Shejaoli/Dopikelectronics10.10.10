import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, ChevronRight } from "lucide-react";

// Shipping schema according to rules
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        setLocation("/shop");
      }
      setCart(parsedCart);
    } else {
      setLocation("/shop");
    }
  }, [setLocation]);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal; // Free shipping

  const form = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
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

  const onSubmit = (data: ShippingForm) => {
    // Store shipping data and move to payment (not implemented in this step as per scope)
    console.log("Shipping data:", data);
    toast({
      title: "Shipping details saved",
      description: "Moving to payment...",
    });
    // For now, redirecting to home since payment step is not required here
    setLocation("/");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/cart" className="hover:text-foreground">Cart</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-bold text-foreground">Information</span>
          <ChevronRight className="h-4 w-4" />
          <span>Payment</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* LEFT: Shipping Form */}
          <div className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* CONTACT */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Contact</h2>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Email" 
                            {...field} 
                            className={`h-12 rounded-xl ${form.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="updates"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="rounded-md"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Send me order updates
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* DELIVERY */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Delivery</h2>
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} disabled className="h-12 rounded-xl bg-muted cursor-not-allowed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="First Name" 
                              {...field} 
                              className={`h-12 rounded-xl ${form.formState.errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Last Name" 
                              {...field} 
                              className={`h-12 rounded-xl ${form.formState.errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Shipping Address" 
                            {...field} 
                            className={`h-12 rounded-xl ${form.formState.errors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="City" 
                              {...field} 
                              className={`h-12 rounded-xl ${form.formState.errors.city ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Province" 
                              {...field} 
                              className={`h-12 rounded-xl ${form.formState.errors.province ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Postal Code" 
                              {...field} 
                              className={`h-12 rounded-xl ${form.formState.errors.postalCode ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Phone Number" 
                            {...field} 
                            className={`h-12 rounded-xl ${form.formState.errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
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
          </div>

          {/* RIGHT: Order Summary */}
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
