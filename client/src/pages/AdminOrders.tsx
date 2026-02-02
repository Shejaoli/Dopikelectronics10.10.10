import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Order, Product } from "@shared/schema";

interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Search, X, Calendar as CalendarIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileText, Download, Eye, ShoppingCart, CheckCircle2, Clock, DollarSign, XCircle, AlertCircle, RefreshCcw, Info, Archive } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortField = "id" | "customerName" | "totalAmount" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminOrders() {
  const { toast } = useToast();
  const { data: ordersResponse, isLoading } = useQuery<PaginatedOrders>({
    queryKey: ["/api/admin/orders"],
  });
  
  const orders = ordersResponse?.data || [];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showWhatsappPreview, setShowWhatsAppPreview] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const whatsappMessage = useMemo(() => {
    if (!selectedOrder) return "";
    const itemsText = selectedOrder.items?.map((item: any) => 
      `- ${item.name}${item.storage ? ` (${item.storage})` : ''}${item.color ? ` (${item.color})` : ''} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`
    ).join('\n') || 'No items listed';

    return `*Order Update - #${selectedOrder.id}*\n\n` +
      `Hello ${selectedOrder.customerName},\n` +
      `Your order is currently: *${selectedOrder.status.toUpperCase()}*\n\n` +
      `*Items:*\n${itemsText}\n\n` +
      `*Order Total: ${formatCurrency(selectedOrder.totalAmount)}*\n\n` +
      `Thank you for shopping with DOPIK ELECTRONICS!`;
  }, [selectedOrder]);

  const exportCSV = async (useFiltered: boolean = true) => {
    if (!orders) return;

    setIsExporting(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const ordersToExport = useFiltered ? filteredAndSortedOrders : orders;

    const headers = ["Order ID", "Customer Name", "Customer Phone", "Total Amount", "Status", "Date", "Payment Provider", "Delivery Location"];
    const csvContent = [
      headers.join(","),
      ...ordersToExport.map(o => [
        o.id,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        o.totalAmount,
        o.status,
        format(new Date(o.createdAt), "yyyy-MM-dd HH:mm"),
        `"${o.paymentProvider || o.paymentMethod || ''}"`,
        `"${o.deliveryLocation || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    let filename = "orders";
    if (useFiltered && (status !== "all" || startDate || endDate || search)) {
      if (status !== "all") filename += `_${status}`;
      if (startDate) filename += `_from${format(startDate, "yyyyMMdd")}`;
      if (endDate) filename += `_to${format(endDate, "yyyyMMdd")}`;
    }
    filename += `_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);

    toast({
      title: "Export complete",
      description: `${ordersToExport.length} orders exported to CSV.`,
    });
  };

  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = orders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search);
      const matchesStatus = status === "all" || order.status === status;

      let matchesDate = true;
      const orderDate = new Date(order.createdAt);

      if (startDate && endDate) {
        matchesDate = isWithinInterval(orderDate, {
          start: startOfDay(startDate),
          end: endOfDay(endDate)
        });
      } else if (startDate) {
        matchesDate = orderDate >= startOfDay(startDate);
      } else if (endDate) {
        matchesDate = orderDate <= endOfDay(endDate);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, search, status, startDate, endDate, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4 inline" /> : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    if (!orders) return { total: 0, paid: 0, pending: 0, revenue: 0 };
    return orders.reduce((acc, order) => {
      acc.total++;
      if (order.status === "paid" || order.status === "completed") acc.paid++;
      if (order.status === "pending") acc.pending++;
      acc.revenue += order.totalAmount;
      return acc;
    }, { total: 0, paid: 0, pending: 0, revenue: 0 });
  }, [orders]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setIsUpdatingStatus(false);
      setPendingStatus(null);
      toast({
        title: "Order status updated",
        description: "The change has been logged in the audit log.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
      await Promise.all(ids.map(id => apiRequest("PATCH", `/api/orders/${id}/status`, { status })));
    },
    onSuccess: (_, { ids, status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setSelectedOrderIds(new Set());
      toast({
        title: `${ids.length} orders updated`,
        description: `Orders have been marked as ${status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Bulk update failed",
        description: error.message,
      });
    },
  });

  const toggleSelectOrder = (orderId: number) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === paginatedOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(paginatedOrders.map(o => o.id)));
    }
  };

  const exportSelectedCSV = () => {
    if (!orders || selectedOrderIds.size === 0) return;
    const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
    const headers = ["Order ID", "Customer Name", "Customer Phone", "Total Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...selectedOrders.map(o => [
        o.id,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        o.totalAmount,
        o.status,
        format(new Date(o.createdAt), "yyyy-MM-dd")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_selected_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export complete",
      description: `${selectedOrders.length} orders exported to CSV.`,
    });
  };

  const handleBulkMarkAsPaid = () => {
    const ids = Array.from(selectedOrderIds);
    bulkStatusMutation.mutate({ ids, status: "paid" });
  };

  const handleBulkArchive = () => {
    const ids = Array.from(selectedOrderIds);
    bulkStatusMutation.mutate({ ids, status: "archived" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 animate-pulse";
      case "paid": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "completed": return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "failed": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "refunded": return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
      case "archived": return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      default: return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: "w-3 h-3 mr-1" };
    switch (status) {
      case "pending": return <Clock {...iconProps} />;
      case "paid": return <CheckCircle2 {...iconProps} />;
      case "processing": return <RefreshCcw {...iconProps} className={`${iconProps.className} animate-spin-slow`} />;
      case "shipped": return <ShoppingCart {...iconProps} />;
      case "completed": return <CheckCircle2 {...iconProps} />;
      case "cancelled": return <XCircle {...iconProps} />;
      case "failed": return <AlertCircle {...iconProps} />;
      case "refunded": return <RefreshCcw {...iconProps} />;
      case "archived": return <Archive {...iconProps} />;
      default: return <Clock {...iconProps} />;
    }
  };

  const getValidNextStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      "pending": ["paid", "cancelled", "failed"],
      "paid": ["processing", "cancelled", "refunded"],
      "processing": ["shipped", "cancelled", "refunded"],
      "shipped": ["completed", "cancelled", "refunded"],
      "completed": ["refunded"],
      "cancelled": [],
      "failed": ["pending", "cancelled"],
      "refunded": []
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Orders</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="hover-elevate gap-2" disabled={isExporting} data-testid="button-export-menu">
              {isExporting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export CSV
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Export Options</h4>
                <p className="text-xs text-muted-foreground">Choose what to include in export</p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => exportCSV(true)}
                  disabled={isExporting}
                  data-testid="button-export-filtered"
                >
                  <FileText className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm">Export Filtered</div>
                    <div className="text-xs text-muted-foreground">
                      {filteredAndSortedOrders.length} orders
                      {status !== "all" && ` (${status})`}
                      {(startDate || endDate) && " with date range"}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => exportCSV(false)}
                  disabled={isExporting}
                  data-testid="button-export-all"
                >
                  <Download className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm">Export All</div>
                    <div className="text-xs text-muted-foreground">{orders?.length || 0} total orders</div>
                  </div>
                </Button>
              </div>
              {(status !== "all" || startDate || endDate || search) && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
                  <div className="flex flex-wrap gap-1">
                    {status !== "all" && (
                      <Badge variant="secondary" className="text-xs">{status}</Badge>
                    )}
                    {startDate && (
                      <Badge variant="secondary" className="text-xs">From: {format(startDate, "MMM d")}</Badge>
                    )}
                    {endDate && (
                      <Badge variant="secondary" className="text-xs">To: {format(endDate, "MMM d")}</Badge>
                    )}
                    {search && (
                      <Badge variant="secondary" className="text-xs">Search: {search}</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-sm:max-w-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer name or phone..."
                className="pl-9 h-10 border-muted-foreground/20 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-orders"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className={cn(
                "w-[160px] h-10 border-muted-foreground/20 font-medium transition-all",
                status === "paid" && "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200",
                status === "processing" && "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200",
                status === "shipped" && "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200",
                status === "completed" && "text-zinc-600 bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200",
                status === "cancelled" && "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200"
              )}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending" className="text-yellow-600">Pending</SelectItem>
                <SelectItem value="paid" className="text-green-600">Paid</SelectItem>
                <SelectItem value="processing" className="text-blue-600">Processing</SelectItem>
                <SelectItem value="shipped" className="text-purple-600">Shipped</SelectItem>
                <SelectItem value="completed" className="text-zinc-600">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-red-600">Cancelled</SelectItem>
                <SelectItem value="archived" className="text-slate-500">Archived</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 w-[160px] pl-9 justify-start font-normal border-muted-foreground/20">
                      {startDate ? format(startDate, "PP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <span className="text-muted-foreground font-medium">to</span>

              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 w-[160px] pl-9 justify-start font-normal border-muted-foreground/20">
                      {endDate ? format(endDate, "PP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(search || status !== "all" || startDate || endDate) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="h-10 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedOrderIds.size > 0 && (
        <Card className="border-none shadow-md bg-primary/5 dark:bg-primary/10 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {selectedOrderIds.size} order{selectedOrderIds.size > 1 ? 's' : ''} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrderIds(new Set())}
                  className="text-muted-foreground"
                  data-testid="button-clear-selection"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsPaid}
                  disabled={bulkStatusMutation.isPending}
                  className="gap-2"
                  data-testid="button-bulk-mark-paid"
                >
                  <DollarSign className="h-4 w-4" />
                  Mark as Paid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSelectedCSV}
                  className="gap-2"
                  data-testid="button-bulk-export"
                >
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  disabled={bulkStatusMutation.isPending}
                  className="gap-2"
                  data-testid="button-bulk-archive"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border-none bg-white dark:bg-zinc-900 shadow-md overflow-hidden">
        <div className="overflow-x-auto relative max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={paginatedOrders.length > 0 && selectedOrderIds.size === paginatedOrders.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all orders"
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort("id")}
                >
                  Order ID <SortIndicator field="id" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort("customerName")}
                >
                  Customer <SortIndicator field="customerName" />
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors text-right"
                  onClick={() => toggleSort("totalAmount")}
                >
                  Total Amount <SortIndicator field="totalAmount" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIndicator field="status" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort("createdAt")}
                >
                  Date <SortIndicator field="createdAt" />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order, index) => (
                <TableRow 
                  key={order.id} 
                  className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/50 dark:bg-zinc-800/30",
                    selectedOrderIds.has(order.id) && "bg-primary/5 dark:bg-primary/10"
                  )}
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedOrderIds.has(order.id)}
                      onCheckedChange={() => toggleSelectOrder(order.id)}
                      aria-label={`Select order ${order.id}`}
                      data-testid={`checkbox-order-${order.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-4">#{order.id}</TableCell>
                  <TableCell className="font-medium py-4">{order.customerName}</TableCell>
                  <TableCell className="py-4">{order.customerPhone}</TableCell>
                  <TableCell className="uppercase text-xs font-bold py-4">{order.paymentProvider || order.paymentMethod || "-"}</TableCell>
                  <TableCell className="text-right py-4 font-medium">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge 
                      className={cn(
                        "font-medium flex items-center w-fit px-2 py-0.5 rounded-full border shadow-sm transition-all",
                        getStatusColor(order.status)
                      )}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order