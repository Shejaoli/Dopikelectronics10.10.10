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
import type { Order } from "@shared/schema";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Search, X, Calendar as CalendarIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type SortField = "id" | "customerName" | "totalAmount" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminOrders() {
  const { toast } = useToast();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order status updated successfully",
        description: "The order status has been successfully updated.",
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
      case "pending": return "secondary";
      case "paid": return "default";
      case "delivered": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
      </div>

      <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer name or phone..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-orders"
            />
          </div>
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-[150px] justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
            <span className="text-muted-foreground">-</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-[150px] justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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

          {(search || status !== "all" || startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 lg:px-3">
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
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
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors"
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell>{order.customerPhone}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-RW", {
                      style: "currency",
                      currency: "RWF",
                      maximumFractionDigits: 0,
                    }).format(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => statusMutation.mutate({ id: order.id, status: value })}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue>
                          <Badge variant={getStatusColor(order.status) as any}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
    </div>
  );
}
