import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder, type Product } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface CheckoutModalProps {
  product: Product;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutModal({ product, quantity, open, onOpenChange }: CheckoutModalProps) {
  const { toast } = useToast();

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      totalAmount: product.price,
      status: "pending",
    },
  });

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
      
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
      };

      const message = `Hello DOPIK ELECTRONICS, my name is ${order.customerName}. I have placed an order for ${quantity}x ${product.name}. Total amount: ${order.totalAmount} RWF. Order ID: #${order.id}. Thank you.`;
      const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(message)}`;
      
      onOpenChange(false);
      form.reset();

      // Small delay to ensure toast is visible before redirect
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Buying: <span className="font-semibold text-foreground">{quantity}x {product.name}</span> for {" "}
            <span className="font-bold text-primary">
              {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(product.price)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => orderMutation.mutate(data))} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0788XXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold transition-all hover-elevate active-elevate-2"
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
