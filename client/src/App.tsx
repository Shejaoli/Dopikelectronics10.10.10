import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Iphones from "@/pages/Iphones";
import Laptops from "@/pages/Laptops";
import Electronics from "@/pages/Electronics";
import HomeKitchen from "@/pages/HomeKitchen";
import Audio from "@/pages/Audio";
import ToolsHomeImprovement from "@/pages/ToolsHomeImprovement";
import Gaming from "@/pages/Gaming";
import Deals from "@/pages/Deals";
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

function VisitorTracker() {
  const [location] = useLocation();

  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem("visitor_id", visitorId);
    }

    apiRequest("POST", "/api/track-visitor", {
      visitorId,
      path: location
    }).catch(err => console.error("Tracking failed", err));
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <VisitorTracker />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/iphones" component={Iphones} />
        <Route path="/laptops" component={Laptops} />
        <Route path="/electronics" component={Electronics} />
        <Route path="/home-kitchen" component={HomeKitchen} />
        <Route path="/audio" component={Audio} />
        <Route path="/tools-home-improvement" component={ToolsHomeImprovement} />
        <Route path="/gaming" component={Gaming} />
        <Route path="/smartphones" component={() => <Shop category="Smartphones" />} />
        <Route path="/tablets" component={() => <Shop category="Tablets" />} />
        <Route path="/smartwatches" component={() => <Shop category="Smartwatches" />} />
        <Route path="/deals" component={Deals} />
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
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
