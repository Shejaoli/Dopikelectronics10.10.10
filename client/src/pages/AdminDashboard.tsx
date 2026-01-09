import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Admin } from "@shared/schema";
import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminEditProduct from "./AdminEditProduct";
import AdminOrders from "./AdminOrders";
import { formatCurrency } from "@/lib/utils";

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

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
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

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: activeTab === "Dashboard",
  });

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
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Orders</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-medium">Products in Stock</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm font-medium">Pending Orders</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">{stats?.pendingOrders ?? 0}</div>
                  </div>
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
