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
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Search, X, Calendar as CalendarIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileText, Download, Eye, ShoppingCart, CheckCircle2, Clock, DollarSign, XCircle, AlertCircle, RefreshCcw, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

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
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

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

  const exportCSV = () => {
    if (!orders) return;
    const headers = ["Order ID", "Customer Name", "Customer Phone", "Total Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...orders.map(o => [
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
    link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight">Orders</h2>
        <Button onClick={exportCSV} variant="outline" size="sm" className="hover-elevate">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
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
                <SelectItem value="paid" className="text-green-600">Paid</SelectItem>
                <SelectItem value="processing" className="text-blue-600">Processing</SelectItem>
                <SelectItem value="shipped" className="text-purple-600">Shipped</SelectItem>
                <SelectItem value="completed" className="text-zinc-600">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-red-600">Cancelled</SelectItem>
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

      <div className="rounded-xl border-none bg-white dark:bg-zinc-900 shadow-md overflow-hidden">
        <div className="overflow-x-auto relative max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow>
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
                    index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/50 dark:bg-zinc-800/30"
                  )}
                  onClick={() => setSelectedOrder(order)}
                >
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
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }} 
                              className="hover-elevate gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Order Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Full details for the selected customer order.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                  <p className="text-base font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Phone</p>
                  <p className="text-base">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p className="text-base">{format(new Date(selectedOrder.createdAt), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      className={cn(
                        "font-medium flex items-center w-fit px-2 py-0.5 rounded-full border shadow-sm",
                        getStatusColor(selectedOrder.status)
                      )}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    
                    {getValidNextStatuses(selectedOrder.status).length > 0 && (
                      <div className="flex items-center gap-2">
                        <Select 
                          value={pendingStatus || ""}
                          onValueChange={(value) => {
                            setPendingStatus(value);
                            setIsUpdatingStatus(true);
                          }}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {getValidNextStatuses(selectedOrder.status).map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {isUpdatingStatus && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              className="h-7 px-2 text-xs" 
                              onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: pendingStatus! })}
                              disabled={statusMutation.isPending}
                            >
                              Confirm
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-xs" 
                              onClick={() => {
                                setIsUpdatingStatus(false);
                                setPendingStatus(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border p-4 rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Order Timeline</h4>
                <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {[
                    { label: "Order Created", status: "created", icon: FileText, color: "text-blue-500" },
                    { label: "Payment Pending", status: "pending", icon: Clock, color: "text-yellow-500" },
                    { label: "Paid", status: "paid", icon: CheckCircle2, color: "text-green-500" },
                    { label: "Completed / Delivered", status: "completed", icon: ShoppingCart, color: "text-purple-500" }
                  ].map((step, idx) => {
                    const isCompleted = 
                      (step.status === "created") || 
                      (step.status === "pending" && ["pending", "paid", "processing", "shipped", "completed"].includes(selectedOrder.status)) ||
                      (step.status === "paid" && ["paid", "processing", "shipped", "completed"].includes(selectedOrder.status)) ||
                      (step.status === "completed" && ["completed"].includes(selectedOrder.status));
                    
                    return (
                      <div key={idx} className="relative flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background z-10 transition-colors duration-200",
                          isCompleted ? "border-primary" : "border-muted"
                        )}>
                          <step.icon className={cn("h-5 w-5", isCompleted ? step.color : "text-muted-foreground")} />
                        </div>
                        <div className="flex flex-col">
                          <p className={cn("text-sm font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                            {step.label}
                          </p>
                          {isCompleted && step.status === "created" && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(selectedOrder.createdAt), "MMM d, yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Order Items</h4>
                <div className="border rounded-lg overflow-hidden bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[40%]">Product</TableHead>
                        <TableHead>Storage</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item: any, index: number) => (
                          <TableRow key={`${item.productId}-${index}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.storage || "-"}</TableCell>
                            <TableCell>{item.color || "-"}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Info className="h-6 w-6 text-muted-foreground/50" />
                              <p>This is an older order without itemized tracking.</p>
                              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => window.alert(`Order Summary for #${selectedOrder.id}: ${formatCurrency(selectedOrder.totalAmount)}`)}>
                                View legacy order summary
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-4">
                <div className="space-y-2">
                  {showWhatsappPreview && (
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border text-xs font-mono whitespace-pre-wrap max-w-md animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-muted-foreground mb-2 font-sans font-bold uppercase tracking-wider">Message Preview</p>
                      {whatsappMessage}
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      if (!showWhatsappPreview) {
                        setShowWhatsAppPreview(true);
                        return;
                      }
                      const phone = selectedOrder.customerPhone.replace(/\D/g, '');
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                      setShowWhatsAppPreview(false);
                    }}
                    disabled={!selectedOrder?.customerPhone}
                    variant={showWhatsappPreview ? "default" : "outline"}
                    className="gap-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-[#25D366]"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {showWhatsappPreview ? "Send Message Now" : "Preview WhatsApp Update"}
                  </Button>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg px-6 py-3 text-right min-w-[200px]">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}