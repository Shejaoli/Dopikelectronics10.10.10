import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Plus, Trash2 } from "lucide-react";

interface AdminAddProductProps {
  onBack: () => void;
}

export default function AdminAddProduct({ onBack }: AdminAddProductProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [specEntries, setSpecEntries] = useState<{ key: string; value: string }[]>([]);

  const handleAdditionalImagesUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const currentImages = form.getValues("additionalImages") || [];
      form.setValue("additionalImages", [...currentImages, ...data.urls]);
      toast({ title: "Images uploaded" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload images.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      brand: "",
      imageUrl: "",
      stockStatus: "in_stock",
      isFeatured: false,
      additionalImages: [],
      specs: {},
    },
  });

  const addSpec = () => {
    setSpecEntries([...specEntries, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecEntries(specEntries.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specEntries];
    newSpecs[index][field] = value;
    setSpecEntries(newSpecs);
  };

  const createMutation = useMutation({
    mutationFn: async (values: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product added successfully",
        description: "The new product has been successfully added.",
      });
      onBack();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: error.message,
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum size is 5MB",
      });
      return null;
    }

    const formData = new FormData();
    formData.append("images", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload error response:", errorText);
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const imageUrl = data.url || (data.urls && data.urls[0]);
      if (imageUrl) {
        form.setValue("imageUrl", imageUrl, { shouldValidate: true });
        return imageUrl;
      }
      throw new Error("No URL returned from server");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const CATEGORIES = [
    "Smartphones",
    "Phones Accessories",
    "Laptops",
    "Tablets",
    "Gaming Consoles",
    "Smartwatches",
    "Audio",
    "Cameras"
  ];

  const BRANDS_BY_CATEGORY: Record<string, string[]> = {
    "Smartphones": ["Apple", "Samsung", "Google", "Huawei", "Sony", "Xiaomi", "Oppo", "OnePlus"],
    "Laptops": ["Apple", "Dell", "HP", "Lenovo", "Microsoft", "Acer", "Asus", "Toshiba", "MSI", "Samsung", "Huawei", "Fujitsu"],
  };

  const LAPTOP_OPTIONS = {
    batteryHealth: ["100%", "90%+", "80%+"],
    charger: ["Included", "Not Included"],
    color: ["Aluminum", "Black", "Carbon Fiber", "Gold", "Gray", "Matte Black"],
    condition: ["Premium", "Excellent", "Good", "Acceptable"],
    cpu: ["Apple M1 / M2 / M3", "Intel i3 / i5 / i7 / i9", "AMD Ryzen"],
    ram: ["8GB", "16GB", "32GB", "64GB"],
    screenSize: ["12\"", "13\"", "14\"", "15\"", "16\""],
    storage: ["128GB", "256GB", "512GB", "1TB", "2TB"],
    touchBar: ["Touch Bar", "No Touch Bar"]
  };

  const onSubmit = async (data: InsertProduct) => {
    const imageUrl = data.imageUrl;

    if (!imageUrl || imageUrl.startsWith("data:")) {
      toast({
        variant: "destructive",
        title: "Image required",
        description: "Please upload the product image first.",
      });
      return;
    }

    // Convert spec entries to object
    const specs: Record<string, string> = {};
    specEntries.forEach(entry => {
      if (entry.key.trim()) {
        specs[entry.key.trim()] = entry.value.trim();
      }
    });

    // Merge with laptop specs if any
    const laptopSpecs = data.specs as Record<string, string> || {};
    Object.assign(specs, laptopSpecs);

    // Update form state with final imageUrl to ensure validation passes
    form.setValue("imageUrl", imageUrl, { shouldValidate: true });

    createMutation.mutate({ ...data, imageUrl, specs });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover-elevate">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Add New Product</h2>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="iPhone 17 Pro Max" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("brand", ""); // Reset brand when category changes
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    {BRANDS_BY_CATEGORY[form.watch("category")] ? (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BRANDS_BY_CATEGORY[form.watch("category")].map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder="Apple" {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Product Image</FormLabel>
              <div className="flex flex-col gap-4">
                {form.watch("imageUrl") && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <img 
                      src={form.watch("imageUrl")} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          form.setValue("imageUrl", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-dashed"
                    onClick={async () => {
                      const input = document.getElementById("image-upload") as HTMLInputElement;
                      input?.click();
                      
                      // Handle file selection and immediate upload
                      input.onchange = async (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleImageUpload(file);
                        }
                      };
                    }}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {form.watch("imageUrl") ? "Change Image" : "Upload Product Image"}
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel>Additional Images</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(form.watch("additionalImages") || []).map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt={`Additional ${idx}`} className="object-cover w-full h-full" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const current = form.getValues("additionalImages") || [];
                        form.setValue("additionalImages", current.filter((_, i) => i !== idx));
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-center">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleAdditionalImagesUpload(e.target.files);
                      }
                    }}
                    className="hidden"
                    id="additional-images-upload"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full aspect-square border-dashed"
                    onClick={() => document.getElementById("additional-images-upload")?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <FormField
                control={form.control}
                name="stockStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="pre_order">Pre-Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Featured Product
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Technical Specifications</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addSpec} className="hover-elevate">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spec
                </Button>
              </div>
              <div className="space-y-3">
                {specEntries.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="e.g. Chip"
                      value={spec.key}
                      onChange={(e) => updateSpec(index, "key", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="e.g. A19 Pro"
                      value={spec.value}
                      onChange={(e) => updateSpec(index, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSpec(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {specEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No specifications added yet.</p>
                )}
              </div>
            </div>

            {form.watch("category") === "Laptops" && (
              <div className="space-y-4 pt-4 border-t">
                <FormLabel className="text-base">Laptop Specifications</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(LAPTOP_OPTIONS).map(([key, options]) => (
                    <div key={key} className="space-y-2">
                      <FormLabel className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const currentSpecs = form.getValues("specs") as Record<string, string> || {};
                          form.setValue("specs", { ...currentSpecs, [key]: value });
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${key}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 transition-all hover-elevate active-elevate-2"
              disabled={createMutation.isPending || isUploading}
            >
              {createMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}