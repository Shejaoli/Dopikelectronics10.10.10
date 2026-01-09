import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Admin } from "@shared/schema";
import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminEditProduct from "./AdminEditProduct";
import AdminOrders from "./AdminOrders";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const { data: admin, isLoading, error } = useQuery<Admin>({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const { data: stats } = useQuery<{ totalOrders: number; totalRevenue: number; totalProducts: number; pendingOrders: number }>({
    queryKey: ["/api/admin/stats"],
    enabled: activeTab === "Dashboard",
  });

  const { data: analytics } = useQuery<{ date: string; orders: number; revenue: number }[]>({
    queryKey: ["/api/admin/analytics"],
    enabled: activeTab === "Dashboard",
  });

  useEffect(() => {
    if (error) {
      setLocation("/admin/login");
    }
  }, [error, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/me"], null);
      toast({
        title: "Logged out",
        description: "You have been securely logged out.",
      });
      setLocation("/admin/login");
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!admin) return null;

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Products", icon: Package },
    { title: "Orders", icon: ShoppingCart },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="p-4">
                <h2 className="text-xl font-bold text-primary mb-6">DOPIK</h2>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={() => setActiveTab(item.title)}
                        isActive={activeTab === item.title}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
            <h1 className="text-lg font-semibold">DOPIK ELECTRONICS – Admin</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{admin.email}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="hover-elevate"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {activeTab === "Products" ? (
              editingProductId ? (
                <AdminEditProduct 
                  productId={editingProductId} 
                  onBack={() => setEditingProductId(null)} 
                />
              ) : showAddProduct ? (
                <AdminAddProduct onBack={() => setShowAddProduct(false)} />
              ) : (
                <AdminProducts 
                  onAddClick={() => setShowAddProduct(true)} 
                  onEditClick={(id) => setEditingProductId(id)}
                />
              )
            ) : activeTab === "Orders" ? (
              <AdminOrders />
            ) : (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
                    </CardContent>
                  </Card>
                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Products in Stock</CardTitle>
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{stats?.pendingOrders ?? 0}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Orders Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={ { backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" } }
                            itemStyle={ { color: "hsl(var(--foreground))" } }
                          />
                          <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="p-4">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Revenue Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            contentStyle={ { backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" } }
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2} 
                            dot={ { r: 4, fill: "hsl(var(--primary))" } }
                            activeDot={ { r: 6 } }
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/30">
                  Welcome to the Admin Dashboard. Select a tab from the sidebar to manage your store.
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
