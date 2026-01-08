import { useQuery } from "@tanstack/react-query";
import { useProducts } from "@/hooks/use-products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminProductsProps {
  onAddClick: () => void;
  onEditClick: (productId: number) => void;
}

export default function AdminProducts({ onAddClick, onEditClick }: AdminProductsProps) {
  const { data: products, isLoading } = useProducts();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <Button onClick={onAddClick} className="hover-elevate active-elevate-2">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover border"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.stockStatus === "in_stock"
                        ? "default"
                        : product.stockStatus === "out_of_stock"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {product.stockStatus.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onEditClick(product.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
