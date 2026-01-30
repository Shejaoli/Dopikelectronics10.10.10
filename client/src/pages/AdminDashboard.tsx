import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Package, ShoppingCart, LogOut, ChevronLeft, ChevronRight, History, Moon, Sun } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Admin } from "@shared/schema";
import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminEditProduct from "./AdminEditProduct";
import AdminOrders from "./AdminOrders";
import AdminAuditLog from "./AdminAuditLog";
import { CircularEconomy } from "./Home";
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
} from "recharts";
import { Recycle, Trash2 as TrashIcon } from "lucide-react";

function AdminVideoList() {
  const { data: videos, isLoading } = useQuery<any[]>({
    queryKey: ["/api/videos"]
  });
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({ title: "Video deleted" });
    }
  });

  if (isLoading) return <div>Loading videos...</div>;

  return (
    <div className="grid gap-2">
      {videos?.map((video) => (
        <div key={video.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
          <div className="flex items-center gap-3">
            <div className="w-16 aspect-video bg-muted rounded overflow-hidden">
              <video src={video.url} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium">{video.title}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm("Delete this video?")) {
                deleteMutation.mutate(video.id);
              }
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {videos?.length === 0 && <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>}
    </div>
  );
}

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
  const [isAdminDark, setIsAdminDark] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isAdminDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("admin-theme", isAdminDark ? "dark" : "light");
  }, [isAdminDark]);

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
    { title: "Circular Economy", icon: Recycle },
    { title: "Audit Log", icon: History },
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-4 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <h2 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">DOPIK</h2>
            <div className="hidden group-data-[collapsible=icon]:block text-xl font-bold text-primary">D</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="p-2">
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={() => setActiveTab(item.title)}
                        isActive={activeTab === item.title}
                        className={`
                          w-full transition-all duration-200 
                          ${activeTab === item.title 
                            ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary rounded-none" 
                            : "hover:bg-muted"
                          }
                        `}
                      >
                        <item.icon className={`w-4 h-4 mr-2 ${activeTab === item.title ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="w-full justify-start hover-elevate group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <LogOut className="w-4 h-4 mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover-elevate" />
              <h1 className="text-lg font-semibold">DOPIK ELECTRONICS – Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {admin.email} ({admin.role})
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAdminDark(!isAdminDark)}
                className="rounded-full"
              >
                {isAdminDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
            ) : activeTab === "Circular Economy" ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/30">
                        <h3 className="font-semibold text-sm">Upload New Video</h3>
                        <div className="grid gap-2">
                          <label className="text-sm">Video File (MP4/WebM)</label>
                          <input 
                            type="file" 
                            accept="video/mp4,video/webm"
                            className="text-sm"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const formData = new FormData();
                              formData.append("video", file);
                              formData.append("title", file.name);

                              try {
                                toast({ title: "Uploading...", description: "Please wait while your video is uploaded." });
                                const response = await fetch("/api/admin/videos/upload", {
                                  method: "POST",
                                  body: formData
                                });
                                
                                if (response.ok) {
                                  toast({ title: "Success!", description: "Video uploaded successfully." });
                                  queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
                                } else {
                                  const error = await response.json();
                                  toast({ variant: "destructive", title: "Upload Failed", description: error.message });
                                }
                              } catch (err) {
                                toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Active Videos</h3>
                        <AdminVideoList />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Website Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-slate-950 rounded-lg p-0 overflow-hidden">
                    <CircularEconomy />
                  </CardContent>
                </Card>
              </div>
            ) : activeTab === "Audit Log" ? (
              <AdminAuditLog />
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
