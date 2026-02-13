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
import { LayoutDashboard, Package, ShoppingCart, LogOut, ChevronLeft, ChevronRight, History, Moon, Sun, Recycle, Trash2 as TrashIcon, CheckCircle2, Circle, Star, RotateCcw, Play, Monitor, Smartphone, ChevronUp, ChevronDown, Clock, DollarSign, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Admin } from "@shared/schema";
import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminEditProduct from "./AdminEditProduct";
import AdminOrders from "./AdminOrders";
import AdminAuditLog from "./AdminAuditLog";
import AdminAnalytics from "./AdminAnalytics";
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

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  onClick
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  trend?: number;
  onClick?: () => void;
}) {
  const isPositive = trend !== undefined && trend > 0;

  // Define gradient background based on color
  const gradientClass = color.includes("primary") 
    ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
    : color.includes("green")
    ? "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent"
    : color.includes("blue")
    ? "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent"
    : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent";

  const iconBgClass = color.includes("primary")
    ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
    : color.includes("green")
    ? "bg-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
    : color.includes("blue")
    ? "bg-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
    : "bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]";

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "border-none shadow-md transition-all duration-300 group overflow-hidden relative cursor-pointer",
        "hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]",
        gradientClass
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20 group-hover:opacity-100 transition-opacity" style={ { color: color.replace('text-', '') } } />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-80">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black tracking-tighter tabular-nums">{value}</p>
              {trend !== undefined && trend !== 0 && (
                <div className={cn(
                  "flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-full",
                  isPositive ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10"
                )}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
          </div>
          <div className={cn("p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", iconBgClass)}>
            <Icon className="w-6 h-6 stroke-[2.5px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount);
}

function VideoUploadForm() {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      setUploadStatus("uploading");
      setUploadProgress(0);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/videos/upload", true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress((e.loaded / e.total) * 100);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.message || "Upload failed"));
            } catch (e) {
              reject(new Error("Upload failed"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      setUploadStatus("success");
      toast({ title: "Success!", description: "Video uploaded successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setSelectedFileName("");

      const input = document.getElementById('video-upload-input') as HTMLInputElement;
      if (input) input.value = "";

      setTimeout(() => {
        setUploadStatus("idle");
        setIsUploading(false);
        setUploadProgress(0);
      }, 3000);
    },
    onError: (error: Error) => {
      setUploadStatus("error");
      setErrorMessage(error.message);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      setIsUploading(false);
    }
  });

  const handleFileChange = (file: File) => {
    if (file) {
      setSelectedFileName(file.name);
      setErrorMessage("");
      const input = document.getElementById('video-upload-input') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
      }
    }
  };

  return (
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
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-all duration-200 border-primary/40 group/upload focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                if (file) handleFileChange(file);
              }}
              onClick={() => document.getElementById('video-upload-input')?.click()}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 rounded-full bg-primary/10 group-hover/upload:bg-primary/20 transition-colors mb-3">
                  <Recycle className="w-8 h-8 text-primary" />
                </div>
                <p className="mb-1 text-sm font-semibold tracking-tight">
                  {selectedFileName || "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">MP4 or WebM · Max 50MB</p>
              </div>
              <input 
                type="file" 
                id="video-upload-input"
                accept="video/mp4,video/webm"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
              />
            </motion.label>
            <Button 
              disabled={isUploading || !selectedFileName}
              className="w-full h-11 font-bold uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                const input = document.getElementById('video-upload-input') as HTMLInputElement;
                const file = input.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("video", file);
                formData.append("title", file.name);
                uploadMutation.mutate(formData);
              }}
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>

            {(isUploading || uploadStatus !== "idle") && (
              <div className="w-full space-y-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${uploadStatus === "error" ? "bg-destructive" : "bg-primary"}`}
                    style={ { width: `${uploadProgress}%` } }
                  ></div>
                </div>
                <p className={`text-[10px] text-center uppercase tracking-tighter font-bold ${
                  uploadStatus === "error" ? "text-destructive" : 
                  uploadStatus === "success" ? "text-green-600 dark:text-green-400" : 
                  "text-muted-foreground"
                }`}>
                  {uploadStatus === "uploading" ? `Uploading... ${Math.round(uploadProgress)}%` : 
                   uploadStatus === "success" ? "Video uploaded successfully" : 
                   uploadStatus === "error" ? `Error: ${errorMessage}` : "Preparing..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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

  const { data: admin, isLoading, error } = useQuery<Admin>({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days" | "custom">("30days");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats", timeRange, customRange.start, customRange.end],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/stats?timeRange=${timeRange}&customRange=${encodeURIComponent(JSON.stringify(customRange))}`);
      return res.json ? await res.json() : res;
    },
    enabled: activeTab === "Dashboard",
  });

  const { data: dashboardData, isLoading: dashLoading } = useQuery<any>({
    queryKey: ["/api/admin/dashboard", timeRange, customRange.start, customRange.end],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/dashboard?timeRange=${timeRange}&customRange=${encodeURIComponent(JSON.stringify(customRange))}`);
      return res.json ? await res.json() : res;
    },
    enabled: activeTab === "Dashboard",
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/admin/analytics", timeRange, customRange.start, customRange.end],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/analytics?timeRange=${timeRange}&customRange=${encodeURIComponent(JSON.stringify(customRange))}`);
      return res.json ? await res.json() : res;
    },
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
    { group: "Overview", items: [
      { title: "Dashboard", icon: LayoutDashboard, description: "Overview of your store performance" },
      { title: "Analytics", icon: TrendingUp, description: "Detailed sales and traffic reports" },
    ]},
    { group: "Management", items: [
      { title: "Products", icon: Package, description: "Manage inventory and pricing" },
      { title: "Orders", icon: ShoppingCart, description: "Process sales and fulfillment" },
      { title: "Videos", icon: Recycle, description: "Manage circular economy videos" },
    ]},
    { group: "System", items: [
      { title: "Audit Log", icon: History, description: "Track all administrative actions" },
      { title: "Settings", icon: Settings, description: "Configure store preferences" },
    ]}
  ];

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar collapsible="icon" className="border-r shadow-xl">
          <SidebarHeader className="p-6 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tighter">DOPIK</h2>
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
              <span className="text-lg font-black text-primary">D</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-3 gap-6">
            {menuItems.map((group) => (
              <SidebarGroup key={group.group} className="p-0">
                <div className="px-3 mb-2 flex items-center justify-between group-data-[collapsible=icon]:hidden">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    {group.group}
                  </span>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.title;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <TooltipProvider delayDuration={100}>
                            <ShadcnTooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton 
                                  onClick={() => setActiveTab(item.title)}
                                  isActive={isActive}
                                  data-testid={`sidebar-menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                  className={cn(
                                    "relative group/btn h-11 px-3 transition-all duration-300 rounded-xl overflow-visible",
                                    isActive 
                                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/20" 
                                      : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                  )}
                                >
                                  <div className="flex items-center w-full">
                                    <item.icon className={cn(
                                      "w-4 h-4 mr-3 transition-all duration-300",
                                      isActive 
                                        ? "text-primary-foreground scale-110" 
                                        : "text-muted-foreground group-hover/btn:text-primary group-hover/btn:scale-110"
                                    )} />
                                    <span className="text-xs font-bold tracking-tight group-data-[collapsible=icon]:hidden">
                                      {item.title}
                                    </span>
                                  </div>
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
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:p-2">
            <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
              <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">System Ready</span>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium">All services operational</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-6">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary transition-all duration-300" />
              <div className="h-6 w-[1px] bg-border/60 hidden md:block" />
              <div className="hidden md:flex flex-col">
                <h1 className="text-sm font-black tracking-tight leading-none mb-1">
                  Welcome back, <span className="text-primary">{admin.email.split('@')[0]}</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end mr-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">Active Session</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <p className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-tighter">Last Login: {new Date(admin.createdAt).toLocaleTimeString()}</p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-2xl border border-border/50">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsAdminDark(!isAdminDark)}
                  className="h-9 w-9 rounded-xl hover:bg-background transition-all duration-300"
                >
                  {isAdminDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-500" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logoutMutation.mutate()}
                  className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 bg-muted/10">
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
            ) : activeTab === "Analytics" ? (
              <AdminAnalytics />
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
                  <VideoUploadForm />

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
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm shadow-sm">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      Performance Overview
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monitor your business metrics in real-time</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
                    <Button 
                      variant={timeRange === "today" ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setTimeRange("today")}
                      className="text-xs font-bold uppercase tracking-tight h-8 px-4"
                    >
                      Today
                    </Button>
                    <Button 
                      variant={timeRange === "7days" ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setTimeRange("7days")}
                      className="text-xs font-bold uppercase tracking-tight h-8 px-4"
                    >
                      7 Days
                    </Button>
                    <Button 
                      variant={timeRange === "30days" ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setTimeRange("30days")}
                      className="text-xs font-bold uppercase tracking-tight h-8 px-4"
                    >
                      30 Days
                    </Button>
                    <div className="flex items-center gap-2 px-2 border-l border-border/50 ml-2">
                      <input 
                        type="date" 
                        value={customRange.start}
                        onChange={(e) => {
                          setCustomRange(prev => ({ ...prev, start: e.target.value }));
                          setTimeRange("custom");
                        }}
                        className="bg-transparent text-xs font-bold border-none focus:ring-0 p-0 h-8 w-28 uppercase"
                      />
                      <span className="text-[10px] font-black opacity-30">TO</span>
                      <input 
                        type="date" 
                        value={customRange.end}
                        onChange={(e) => {
                          setCustomRange(prev => ({ ...prev, end: e.target.value }));
                          setTimeRange("custom");
                        }}
                        className="bg-transparent text-xs font-bold border-none focus:ring-0 p-0 h-8 w-28 uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard 
                    title="Total Revenue" 
                    value={formatCurrency(stats?.totalRevenue || 0)} 
                    icon={DollarSign} 
                    color="text-primary" 
                    trend={stats?.trends?.revenue}
                    onClick={() => setActiveTab("Orders")}
                  />
                  <StatsCard 
                    title="Total Orders" 
                    value={stats?.totalOrders || 0} 
                    icon={ShoppingCart} 
                    color="text-blue-500" 
                    trend={stats?.trends?.orders}
                    onClick={() => setActiveTab("Orders")}
                  />
                  <StatsCard 
                    title="Paid Orders" 
                    value={stats?.paidOrders || 0} 
                    icon={CheckCircle2} 
                    color="text-green-500" 
                    onClick={() => setActiveTab("Orders")}
                  />
                  <StatsCard 
                    title="Pending Orders" 
                    value={stats?.pendingOrders || 0} 
                    icon={Clock} 
                    color="text-amber-500" 
                    trend={stats?.trends?.pending}
                    onClick={() => setActiveTab("Orders")}
                  />
                </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="lg:col-span-2 overflow-hidden border-none shadow-md bg-card">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Revenue & Orders Over Time
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="h-[300px] w-full flex items-center justify-center relative">
                            {(!dashboardData?.chartData || dashboardData.chartData.length === 0) ? (
                              <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/5 rounded-xl border border-dashed border-border/50">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No data available for selected period</p>
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.chartData || []}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                                  <XAxis 
                                    dataKey="date" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  />
                                  <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `?${(value / 1000)}k`}
                                  />
                                  <RechartsTooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--card))', 
                                      border: '1px solid hsl(var(--border) / 0.5)',
                                      borderRadius: '8px',
                                      fontSize: '12px'
                                    }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={3} 
                                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="hsl(var(--blue-500))" 
                                    strokeWidth={2} 
                                    dot={{ fill: 'hsl(var(--blue-500))', r: 3 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-6">
                        <Card className={cn(
                          "overflow-hidden border-none shadow-md bg-card transition-all duration-300 ring-1",
                          (!stats?.lowStockProducts || stats.lowStockProducts.length === 0) 
                            ? "ring-green-500/10" 
                            : "ring-red-500/10"
                        )}>
                          <CardHeader className={cn(
                            "border-b pb-3 transition-colors",
                            (!stats?.lowStockProducts || stats.lowStockProducts.length === 0)
                              ? "bg-green-500/5 border-green-500/10"
                              : "bg-red-500/5 border-red-500/10"
                          )}>
                            <CardTitle className={cn(
                              "text-xs font-black uppercase tracking-widest flex items-center gap-2",
                              (!stats?.lowStockProducts || stats.lowStockProducts.length === 0)
                                ? "text-green-600"
                                : "text-red-600"
                            )}>
                              {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Stock Status
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Low Stock Alert
                                </>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                              {stats?.lowStockProducts?.map((product: any) => (
                                <div key={product.id} className="p-3 hover:bg-red-500/5 transition-colors flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold truncate leading-tight">{product.name}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">{product.brand}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-black text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded">LOW</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setActiveTab("Products")}>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
                                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  </div>
                                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Stock is healthy</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-none shadow-md bg-card ring-1 ring-amber-500/10">
                          <CardHeader className="bg-amber-500/5 border-b border-amber-500/10 pb-3">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Action
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                              {stats?.pendingOrdersList?.map((order: any) => (
                                <div key={order.id} className="p-3 hover:bg-amber-500/5 transition-colors flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold truncate leading-tight">Order #{order.id}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">{order.customerName}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary shrink-0" onClick={() => setActiveTab("Orders")}>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                              {(!stats?.pendingOrdersList || stats.pendingOrdersList.length === 0) && (
                                <div className="p-8 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No pending orders</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
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