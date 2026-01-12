import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import TrackOrder from "@/pages/TrackOrder";
import MyOrders from "@/pages/MyOrders";
import OrderLookup from "@/pages/OrderLookup";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout/shipping" component={Checkout} />
      <Route path="/checkout/payment" component={Checkout} />
      <Route path="/order/success" component={Checkout} />
      <Route path="/order-success" component={Checkout} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/orders/lookup" component={OrderLookup} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PayPalScriptProvider options={{ 
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
        currency: "USD",
        intent: "capture"
      }}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </PayPalScriptProvider>
    </QueryClientProvider>
  );
}

export default App;
