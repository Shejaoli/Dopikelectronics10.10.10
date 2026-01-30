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
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Package, ShoppingCart, LogOut, ChevronLeft, ChevronRight, History, Moon, Sun, Recycle, Trash2 as TrashIcon, CheckCircle2, Circle, Star, RotateCcw, Play, Monitor, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
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
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function AdminVideoList() {
  const { data: videos, isLoading } = useQuery<any[]>({
    queryKey: ["/api/videos"]
  });
  const { toast } = useToast();

  const activeDbVideos = videos?.filter(v => v.isActive) || [];
  const featuredVideo = activeDbVideos.find(v => v.isFeatured);
  const displayVideos = featuredVideo 
    ? [featuredVideo, ...activeDbVideos.filter(v => v.id !== featuredVideo.id)].slice(0, 2)
    : activeDbVideos.slice(0, 2);
  
  const displayVideoIds = displayVideos.map(v => v.id);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({ title: "Video deleted" });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive, isFeatured }: { id: number; isActive?: boolean; isFeatured?: boolean }) => {
      await apiRequest("PATCH", `/api/admin/videos/${id}`, { isActive, isFeatured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({ title: "Updated successfully" });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-md animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Recycle className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">No videos found</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Upload your first video to showcase your circular economy commitment.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="grid" aria-label="Video management table">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-xs text-muted-foreground">Preview</th>
              <th scope="col" className="px-4 py-3 font-semibold text-xs text-muted-foreground">Filename</th>
              <th scope="col" className="px-4 py-3 font-semibold text-xs text-muted-foreground">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold text-xs text-muted-foreground">Featured</th>
              <th scope="col" className="px-4 py-3 font-semibold text-xs text-muted-foreground">Uploaded</th>
              <th scope="col" className="px-4 py-3 font-semibold text-xs text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {videos.map((video) => {
              const isLive = displayVideoIds.includes(video.id) && video.isActive;
              return (
                <tr key={video.id} className={`hover:bg-muted/30 transition-colors group ${isLive ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className={`w-20 aspect-video bg-muted rounded-md overflow-hidden ring-1 shadow-sm relative group/video ${isLive ? "ring-primary ring-2" : "ring-border"}`}>
                      <video src={video.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => window.open(video.url, '_blank')}>
                          <Play className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      {isLive && (
                        <div className="absolute top-1 left-1 bg-primary text-[8px] font-black uppercase text-primary-foreground px-1 py-0.5 rounded shadow-sm">
                          Live
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium truncate max-w-[150px]">{video.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${video.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                        {video.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     <Button
                      variant={video.isFeatured ? "default" : "outline"}
                      size="sm"
                      data-testid={`button-feature-video-${video.id}`}
                      aria-label={video.isFeatured ? `Remove ${video.title} from featured` : `Set ${video.title} as featured`}
                      aria-pressed={video.isFeatured}
                      className={`h-8 px-3 gap-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${video.isFeatured ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-700 focus-visible:ring-amber-500" : "focus-visible:ring-primary"}`}
                      onClick={() => toggleMutation.mutate({ id: video.id, isFeatured: !video.isFeatured })}
                    >
                      <Star className={`h-4 w-4 ${video.isFeatured ? "fill-current" : ""}`} aria-hidden="true" />
                      {video.isFeatured ? 'Featured' : 'Set Featured'}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-preview-video-${video.id}`}
                        aria-label={`Preview video ${video.title}`}
                        className="h-8 gap-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        Preview
                      </Button>
                      <Button
                        variant={video.isActive ? "default" : "secondary"}
                        size="sm"
                        data-testid={`button-toggle-video-${video.id}`}
                        aria-label={video.isActive ? `Disable video ${video.title}` : `Enable video ${video.title}`}
                        aria-pressed={video.isActive}
                        className="h-8 gap-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        onClick={() => toggleMutation.mutate({ id: video.id, isActive: !video.isActive })}
                      >
                        {video.isActive ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-4 w-4" aria-hidden="true" />}
                        {video.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        data-testid={`button-delete-video-${video.id}`}
                        aria-label={`Delete video ${video.title}`}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 transition-colors"
                        onClick={() => {
                          if (confirm("Are you sure you want to permanently delete this video? This action cannot be undone.")) {
                            deleteMutation.mutate(video.id);
                          }
                        }}
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!admin) return null;

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, description: "Overview of your store performance" },
    { title: "Products", icon: Package, description: "Manage your electronic inventory" },
    { title: "Orders", icon: ShoppingCart, description: "Track and update customer orders" },
    { title: "Circular Economy", icon: Recycle, description: "Manage sustainable promotion videos" },
    { title: "Audit Log", icon: History, description: "Review administrative actions" },
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
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <TooltipProvider delayDuration={100}>
                        <ShadcnTooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton 
                              onClick={() => setActiveTab(item.title)}
                              isActive={activeTab === item.title}
                              data-testid={`sidebar-menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                              className={`
                                w-full transition-all duration-200 ease-out group/item relative rounded-lg
                                ${activeTab === item.title 
                                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/20 shadow-sm" 
                                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                }
                              `}
                            >
                              <motion.div
                                className="flex items-center w-full"
                                whileHover={{ x: 2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <item.icon className={`w-4 h-4 mr-3 transition-all duration-200 ${activeTab === item.title ? "text-primary" : "text-muted-foreground group-hover/item:text-primary"}`} />
                                <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                              </motion.div>
                              {activeTab === item.title && (
                                <motion.div 
                                  layoutId="active-indicator"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" 
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            sideOffset={8}
                            className="bg-slate-900 text-white border-slate-700 font-medium text-xs px-3 py-2 shadow-xl"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold">{item.title}</span>
                              <span className="text-slate-400 text-[10px]">{item.description}</span>
                            </div>
                          </TooltipContent>
                        </ShadcnTooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:p-2">
            <TooltipProvider delayDuration={100}>
              <ShadcnTooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  >
                    <LogOut className="w-4 h-4 mr-2 group-data-[collapsible=icon]:mr-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  sideOffset={8}
                  className="bg-slate-900 text-white border-slate-700 font-medium text-xs px-3 py-2 shadow-xl"
                >
                  Sign out of admin panel
                </TooltipContent>
              </ShadcnTooltip>
            </TooltipProvider>
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-8 max-w-4xl mx-auto"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">Circular Economy Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your sustainable electronics promotion videos.</p>
                </div>

                <div className="grid gap-8">
                  <Card className="border-none shadow-md bg-primary/5 ring-1 ring-primary/20 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Upload New Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="flex flex-col gap-4 items-center">
                          <motion.label 
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            tabIndex={0}
                            role="button"
                            aria-label="Upload video file. Click or press Enter to browse files. You can also drag and drop."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('video-upload-input')?.click();
                              }
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('ring-2', 'ring-primary', 'bg-primary/10');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                const input = document.getElementById('video-upload-input') as HTMLInputElement;
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                input.files = dataTransfer.files;
                                const btn = document.getElementById('upload-submit-btn') as HTMLButtonElement;
                                const label = e.currentTarget.querySelector('p.mb-1') as HTMLParagraphElement;
                                if (btn) btn.disabled = false;
                                if (label) label.textContent = file.name;
                              }
                            }}
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-all duration-200 border-primary/40 group/upload focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="p-3 rounded-full bg-primary/10 group-hover/upload:bg-primary/20 transition-colors mb-3" aria-hidden="true">
                                <Recycle className="w-8 h-8 text-primary" />
                              </div>
                              <p className="mb-1 text-sm font-semibold tracking-tight">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">MP4 or WebM · Max 50MB</p>
                            </div>
                            <input 
                              type="file" 
                              id="video-upload-input"
                              accept="video/mp4,video/webm"
                              className="sr-only"
                              aria-describedby="upload-help-text"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const btn = document.getElementById('upload-submit-btn') as HTMLButtonElement;
                                  const label = e.target.parentElement?.querySelector('p.mb-1') as HTMLParagraphElement;
                                  if (btn) btn.disabled = false;
                                  if (label) label.textContent = file.name;
                                }
                              }}
                            />
                          </motion.label>
                          <Button 
                            id="upload-submit-btn"
                            disabled
                            data-testid="button-upload-video"
                            className="w-full h-11 font-bold uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            onClick={async () => {
                              const input = document.getElementById('video-upload-input') as HTMLInputElement;
                              const file = input.files?.[0];
                              if (!file) return;
                              
                              const allowedTypes = ["video/mp4", "video/webm"];
                              if (!allowedTypes.includes(file.type)) {
                                toast({ variant: "destructive", title: "Unsupported format", description: "Please upload MP4 or WebM videos." });
                                return;
                              }

                              const maxSize = 50 * 1024 * 1024; // 50MB
                              if (file.size > maxSize) {
                                toast({ 
                                  variant: "destructive", 
                                  title: "File too large", 
                                  description: "Maximum video size is 50MB. Please optimize your video before uploading." 
                                });
                                return;
                              }

                              const formData = new FormData();
                              formData.append("video", file);
                              formData.append("title", file.name);

                              const btn = document.getElementById('upload-submit-btn') as HTMLButtonElement;
                              btn.disabled = true;

                              const xhr = new XMLHttpRequest();
                              xhr.open("POST", "/api/admin/videos/upload", true);

                              const progressContainer = document.getElementById('upload-progress-container');
                              const progressBar = document.getElementById('upload-progress-bar');
                              if (progressContainer) progressContainer.classList.remove('hidden');

                              xhr.upload.onprogress = (e) => {
                                if (e.lengthComputable && progressBar) {
                                  const percentComplete = (e.loaded / e.total) * 100;
                                  progressBar.style.width = percentComplete + "%";
                                }
                              };

                              xhr.onload = () => {
                                if (xhr.status === 201) {
                                  const statusText = document.getElementById('upload-status-text');
                                  const progressIcon = document.getElementById('upload-progress-icon');
                                  if (statusText) {
                                    statusText.textContent = "Video uploaded successfully";
                                    statusText.className = "text-[10px] text-center uppercase tracking-tighter font-bold text-green-600 dark:text-green-400";
                                  }
                                  if (progressIcon) {
                                    progressIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                  }
                                  
                                  toast({ title: "Success!", description: "Video uploaded successfully." });
                                  queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
                                  input.value = "";
                                  const label = input.parentElement?.querySelector('p.mb-1') as HTMLParagraphElement;
                                  if (label) label.textContent = "Click to upload or drag and drop";
                                  
                                  setTimeout(() => {
                                    if (progressContainer) progressContainer.classList.add('hidden');
                                    if (progressBar) progressBar.style.width = "0%";
                                    if (statusText) {
                                      statusText.textContent = "Uploading video...";
                                      statusText.className = "text-[10px] text-center uppercase tracking-tighter font-bold text-muted-foreground";
                                    }
                                    if (progressIcon) progressIcon.innerHTML = '';
                                  }, 3000);
                                } else {
                                  let message = "Upload failed";
                                  try {
                                    const error = JSON.parse(xhr.responseText);
                                    message = error.message;
                                  } catch (e) {}
                                  
                                  const statusText = document.getElementById('upload-status-text');
                                  if (statusText) {
                                    statusText.textContent = `Error: ${message}`;
                                    statusText.className = "text-[10px] text-center uppercase tracking-tighter font-bold text-destructive";
                                  }
                                  
                                  toast({ variant: "destructive", title: "Upload Failed", description: message });
                                  btn.disabled = false;
                                }
                              };

                              xhr.onerror = () => {
                                const statusText = document.getElementById('upload-status-text');
                                if (statusText) {
                                  statusText.textContent = "Error: An unexpected error occurred";
                                  statusText.className = "text-[10px] text-center uppercase tracking-tighter font-bold text-destructive";
                                }
                                toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
                                btn.disabled = false;
                              };

                              xhr.send(formData);
                            }}
                          >
                            Upload Video
                          </Button>
                          <p id="upload-help-text" className="text-xs text-muted-foreground text-center">
                            Your video will appear instantly on the website
                          </p>
                          <div id="upload-progress-container" className="w-full hidden space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div id="upload-progress-bar" className="h-full bg-primary transition-all duration-300 w-0"></div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div id="upload-progress-icon"></div>
                              <p id="upload-status-text" className="text-[10px] text-center uppercase tracking-tighter font-bold text-muted-foreground">Uploading video...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Active Videos</h3>
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                      <CardContent className="p-0">
                        <AdminVideoList />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Live Website Preview</h3>
                        <p className="text-xs text-muted-foreground">
                          Homepage – Circular Economy Section
                        </p>
                      </div>
                      <div className="flex items-center gap-2" role="group" aria-label="Preview mode toggle">
                        <div className="flex items-center bg-muted p-1 rounded-md mr-2">
                          <Button
                            variant={previewMode === "desktop" ? "secondary" : "ghost"}
                            size="sm"
                            data-testid="button-preview-desktop"
                            aria-pressed={previewMode === "desktop"}
                            className="h-8 px-3 gap-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            onClick={() => setPreviewMode("desktop")}
                          >
                            <Monitor className="h-4 w-4" aria-hidden="true" />
                            Desktop
                          </Button>
                          <Button
                            variant={previewMode === "mobile" ? "secondary" : "ghost"}
                            size="sm"
                            data-testid="button-preview-mobile"
                            aria-pressed={previewMode === "mobile"}
                            className="h-8 px-3 gap-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            onClick={() => setPreviewMode("mobile")}
                          >
                            <Smartphone className="h-4 w-4" aria-hidden="true" />
                            Mobile
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid="button-refresh-preview"
                          className="h-8 gap-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/videos"] })}
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-center transition-all duration-500 ease-in-out">
                      <Card className={`border-none shadow-2xl overflow-hidden bg-slate-950 transition-all duration-500 ${previewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full"}`}>
                        <div className={`${previewMode === "mobile" ? "scale-[0.8] origin-top h-[125%]" : ""}`}>
                          <CircularEconomy />
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </motion.div>
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
                          <RechartsTooltip 
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
                          <RechartsTooltip 
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
