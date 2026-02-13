import { db } from "./db";
import { products, admins, orders, auditLogs, videos, type Product, type InsertProduct, type Admin, type InsertAdmin, type Order, type InsertOrder, type AuditLog, type InsertAuditLog, type Video, type InsertVideo } from "@shared/schema";
import { eq, like, and, desc, gte, lte, or } from "drizzle-orm";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IStorage {
  getProducts(filters?: { category?: string; featured?: boolean; search?: string; stockStatus?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Admin methods
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: number): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Order methods
  getOrders(filters?: { search?: string; status?: string; startDate?: string; endDate?: string }): Promise<Order[]>;
  getOrdersPaginated(filters?: { search?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<PaginatedResult<Order>>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getProductByNameAndBrand(name: string, brand: string): Promise<Product | undefined>;
  getAdminStats(filters?: { startDate?: string; endDate?: string }): Promise<{ 
    totalOrders: number; 
    totalRevenue: number; 
    totalProducts: number; 
    pendingOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    lowStockCount: number;
    recentOrders: Order[];
    pendingOrdersList: Order[];
    lowStockProducts: Product[];
    trends: {
      orders: number;
      revenue: number;
      products: number;
      pending: number;
    };
  }>;
  getPeriodicAnalytics(period: "day" | "week" | "month", filters?: { startDate?: string; endDate?: string }): Promise<{ 
    period: string; 
    orders: number; 
    revenue: number;
    aov: number;
  }[]>;
  getDailyAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<{ date: string; orders: number; revenue: number }[]>;

  // Audit methods
  getAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsPaginated(filters?: { page?: number; limit?: number; actionType?: string }): Promise<PaginatedResult<AuditLog>>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Dashboard Aggregation
  getDashboardOverview(filters?: { startDate?: string; endDate?: string }): Promise<any>;

  // Video methods
  getVideos(): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  deleteVideo(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { category?: string; featured?: boolean; search?: string; stockStatus?: string }): Promise<Product[]> {
    let conditions = [];

    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters?.featured) {
      conditions.push(eq(products.isFeatured, true));
    }
    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }
    if (filters?.stockStatus) {
      conditions.push(eq(products.stockStatus, filters.stockStatus));
    }

    if (conditions.length > 0) {
      return await db.select().from(products).where(and(...conditions));
    }

    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: any): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: any): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    if (!updatedProduct) throw new Error("Product not found");
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    if (!deletedProduct) throw new Error("Product not found");
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async getOrders(filters?: { search?: string; status?: string; startDate?: string; endDate?: string }): Promise<Order[]> {
    let conditions = [];

    if (filters?.search) {
      conditions.push(and(
        like(orders.customerName, `%${filters.search}%`),
        like(orders.customerPhone, `%${filters.search}%`)
      ));
      // Note: In a real app we might want OR, but for simple filtering AND with customer name/phone is often used or we just check both
      // Re-evaluating: user wants customer name OR customer phone
    }

    // Correcting search condition for OR
    let query = db.select().from(orders);

    let searchConditions = [];
    if (filters?.search) {
      searchConditions.push(like(orders.customerName, `%${filters.search}%`));
      searchConditions.push(like(orders.customerPhone, `%${filters.search}%`));
    }

    let finalConditions = [];
    if (filters?.search) {
      finalConditions.push(or(
        like(orders.customerName, `%${filters.search}%`),
        like(orders.customerPhone, `%${filters.search}%`)
      ));
    }
    if (filters?.status) {
      finalConditions.push(eq(orders.status, filters.status));
    }
    if (filters?.startDate) {
      finalConditions.push(gte(orders.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      finalConditions.push(lte(orders.createdAt, new Date(filters.endDate)));
    }

    if (finalConditions.length > 0) {
      return await db.select().from(orders).where(and(...finalConditions)).orderBy(desc(orders.createdAt));
    }

    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersPaginated(filters?: { search?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<PaginatedResult<Order>> {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 20));
    const offset = (page - 1) * limit;

    let finalConditions = [];
    if (filters?.search) {
      finalConditions.push(or(
        like(orders.customerName, `%${filters.search}%`),
        like(orders.customerPhone, `%${filters.search}%`)
      ));
    }
    if (filters?.status) {
      finalConditions.push(eq(orders.status, filters.status));
    }
    if (filters?.startDate) {
      finalConditions.push(gte(orders.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      finalConditions.push(lte(orders.createdAt, new Date(filters.endDate)));
    }

    const whereClause = finalConditions.length > 0 ? and(...finalConditions) : undefined;

    const allOrders = whereClause 
      ? await db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).orderBy(desc(orders.createdAt));

    const total = allOrders.length;
    const data = allOrders.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createOrder(order: any): Promise<Order> {
    return await db.transaction(async (tx) => {
      // 1. Validate and Deduct Stock
      for (const item of order.items || []) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (item.storage || item.color) {
          const variations = { ...(product.variations || {}) };
          let updated = false;
          let prevStock: number | undefined;
          let newStock: number | undefined;
          let variationLabel = "";

          if (item.storage && variations.storage) {
            const storageOpt = variations.storage.find((s: any) => s.option === item.storage);
            if (storageOpt) {
              if ((storageOpt.stock ?? 0) < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${item.storage})`);
              }
              prevStock = storageOpt.stock;
              storageOpt.stock = (storageOpt.stock ?? 0) - item.quantity;
              newStock = storageOpt.stock;
              variationLabel = item.storage;
              updated = true;
            }
          }

          if (item.color && variations.colors) {
            const colorOpt = variations.colors.find((c: any) => c.name === item.color);
            if (colorOpt) {
              if ((colorOpt.stock ?? 0) < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${item.color})`);
              }
              // If already updated storage, we use the current newStock for prevStock or just rely on the final update
              prevStock = prevStock ?? colorOpt.stock; 
              colorOpt.stock = (colorOpt.stock ?? 0) - item.quantity;
              newStock = colorOpt.stock;
              variationLabel = variationLabel ? `${variationLabel}, ${item.color}` : item.color;
              updated = true;
            }
          }

          if (updated) {
            await tx.update(products).set({ variations }).where(eq(products.id, product.id));
            await tx.insert(auditLogs).values({
              action: `Stock Deducted (Order Creation): ${product.name} (${variationLabel}) x${item.quantity}`,
              adminEmail: "system",
              actionType: "stock_deduction",
              targetType: "Product",
              targetId: product.id,
              previousValue: prevStock?.toString(),
              newValue: newStock?.toString(),
            }).catch(err => console.error("Audit log failed:", err));
          }
        } else {
          // If the project doesn't have non-variation stock field yet, we follow the current pattern
          // but strictly variations are required by the prompt rules
          console.warn(`Product ${product.name} has no variation stock to deduct.`);
        }
      }

      // 2. Create Order
      const [newOrder] = await tx.insert(orders).values({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryLocation: order.deliveryLocation || null,
        paymentMethod: order.paymentMethod || null,
        paymentProvider: order.paymentProvider || null,
        paymentReference: order.paymentReference || null,
        totalAmount: order.totalAmount,
        currency: order.currency || "RWF",
        status: order.status || "pending",
        items: order.items || [],
      }).returning();

      return newOrder;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, id));
      if (!order) throw new Error("Order not found");

      const oldStatus = order.status;
      const nextStatus = status;

      // Deduct stock when moving to confirmed
      if (nextStatus === "confirmed" && oldStatus !== "confirmed") {
        for (const item of order.items || []) {
          const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
          if (!product) {
            console.warn(`Product ${item.productId} not found for stock deduction. Skipping.`);
            continue;
          }

          if (item.storage || item.color) {
            // Variation stock
            const variations = product.variations || {};
            let updated = false;
            let prevStock: number | undefined;
            let newStock: number | undefined;

            if (item.storage && variations.storage) {
              const storageOpt = variations.storage.find((s: any) => s.option === item.storage);
              if (storageOpt) {
                if ((storageOpt.stock ?? 0) < item.quantity) {
                  throw new Error(`Insufficient stock for ${product.name} (${item.storage})`);
                }
                prevStock = storageOpt.stock;
                storageOpt.stock = (storageOpt.stock ?? 0) - item.quantity;
                newStock = storageOpt.stock;
                updated = true;
              }
            }

            if (item.color && variations.colors) {
              const colorOpt = variations.colors.find((c: any) => c.name === item.color);
              if (colorOpt) {
                if ((colorOpt.stock ?? 0) < item.quantity) {
                  throw new Error(`Insufficient stock for ${product.name} (${item.color})`);
                }
                prevStock = colorOpt.stock;
                colorOpt.stock = (colorOpt.stock ?? 0) - item.quantity;
                newStock = colorOpt.stock;
                updated = true;
              }
            }

            if (updated) {
              await tx.update(products).set({ variations }).where(eq(products.id, product.id));
              // Log stock deduction
              await tx.insert(auditLogs).values({
                action: `Stock Deducted: ${product.name} (${item.storage || item.color}) x${item.quantity}`,
                adminEmail: "system", // Admin email will be updated in routes
                actionType: "stock_deduction",
                targetType: "Product",
                targetId: product.id,
                previousValue: prevStock?.toString(),
                newValue: newStock?.toString(),
              }).catch(err => console.error("Audit log failed:", err));
            }
          } else {
            console.warn(`Product ${product.name} has no numeric stock field for non-variation items. Skipping deduction.`);
          }
        }
      }

      // Restore stock if cancelled or reverted from confirmed/paid before Delivered
      const isReverting = (oldStatus === "confirmed" || oldStatus === "paid") && (nextStatus === "pending" || nextStatus === "cancelled");
      if (isReverting) {
        for (const item of order.items || []) {
          const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
          if (!product) continue;

          if (item.storage || item.color) {
            const variations = product.variations || {};
            let updated = false;
            let prevStock: number | undefined;
            let newStock: number | undefined;

            if (item.storage && variations.storage) {
              const storageOpt = variations.storage.find((s: any) => s.option === item.storage);
              if (storageOpt) {
                prevStock = storageOpt.stock;
                storageOpt.stock = (storageOpt.stock ?? 0) + item.quantity;
                newStock = storageOpt.stock;
                updated = true;
              }
            }

            if (item.color && variations.colors) {
              const colorOpt = variations.colors.find((c: any) => c.name === item.color);
              if (colorOpt) {
                prevStock = colorOpt.stock;
                colorOpt.stock = (colorOpt.stock ?? 0) + item.quantity;
                newStock = colorOpt.stock;
                updated = true;
              }
            }

            if (updated) {
              await tx.update(products).set({ variations }).where(eq(products.id, product.id));
              // Log stock restoration
              await tx.insert(auditLogs).values({
                action: `Stock Restored (${nextStatus === 'cancelled' ? 'Cancellation' : 'Revert'}): ${product.name} (${item.storage || item.color}) x${item.quantity}`,
                adminEmail: "system",
                actionType: "stock_restoration",
                targetType: "Product",
                targetId: product.id,
                previousValue: prevStock?.toString(),
                newValue: newStock?.toString(),
              }).catch(err => console.error("Audit log failed:", err));
            }
          }
        }
      }

      const [updatedOrder] = await tx
        .update(orders)
        .set({ status: nextStatus })
        .where(eq(orders.id, id))
        .returning();

      return updatedOrder;
    });
  }

  async getProductByNameAndBrand(name: string, brand: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.name, name), eq(products.brand, brand)));
    return product;
  }

  async getAdminStats(filters?: { startDate?: string; endDate?: string }): Promise<any> {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);

    let currentPeriodOrders = allOrders;
    if (filters?.startDate || filters?.endDate) {
      console.log(`[Stats] Filtering orders from ${filters.startDate} to ${filters.endDate}`);
      currentPeriodOrders = allOrders.filter(o => {
        const date = new Date(o.createdAt);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;

        // Normalize dates to start/end of day to avoid timezone/time issues
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
      });
      console.log(`[Stats] Found ${currentPeriodOrders.length} orders in current period`);
    }

    // Previous period for trends (same duration)
    let previousPeriodOrders: Order[] = [];
    if (filters?.startDate) {
      const start = new Date(filters.startDate);
      const end = filters.endDate ? new Date(filters.endDate) : new Date();
      const duration = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = start;

      previousPeriodOrders = allOrders.filter(o => {
        const date = new Date(o.createdAt);
        return date >= prevStart && date < prevEnd;
      });
    }

    const paidStatuses = ["paid", "shipped", "completed", "delivered", "confirmed", "processing", "pending"];
    const totalOrders = currentPeriodOrders.length;
    const paidOrders = currentPeriodOrders.filter(o => paidStatuses.includes(o.status));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const previousRevenue = previousPeriodOrders
      .filter(o => paidStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalProducts = allProducts.length;
    const pendingOrders = currentPeriodOrders.filter(o => o.status === "pending").length;

    const lowStockProducts = allProducts.filter(p => {
      if (!p.variations) return false;
      const variations = p.variations as any;
      const hasLowStockStorage = variations.storage?.some((s: any) => s.stock !== undefined && s.stock < 10);
      const hasLowStockColor = variations.colors?.some((c: any) => c.stock !== undefined && c.stock < 10);
      return hasLowStockStorage || hasLowStockColor;
    });

    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      pendingOrders,
      lowStockCount: lowStockProducts.length,
      recentOrders: [...currentPeriodOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      pendingOrdersList: currentPeriodOrders.filter(o => o.status === "pending").slice(0, 5),
      lowStockProducts: lowStockProducts.slice(0, 5),
      trends: {
        orders: calculateTrend(totalOrders, previousPeriodOrders.length),
        revenue: calculateTrend(totalRevenue, previousRevenue),
        products: 0,
        pending: calculateTrend(
          pendingOrders,
          previousPeriodOrders.filter(o => o.status === "pending").length
        )
      }
    };
  }

  async getPeriodicAnalytics(period: "day" | "week" | "month", filters?: { startDate?: string; endDate?: string }): Promise<{ 
    period: string; 
    orders: number; 
    revenue: number;
    aov: number;
  }[]> {
    let allOrders = await db.select().from(orders);
    if (filters?.startDate || filters?.endDate) {
      allOrders = allOrders.filter(o => {
        const date = new Date(o.createdAt);
        if (filters.startDate && date < new Date(filters.startDate)) return false;
        if (filters.endDate && date > new Date(filters.endDate)) return false;
        return true;
      });
    }
    const periodicData: Record<string, { orders: number; revenue: number }> = {};

    allOrders.forEach(order => {
      const date = new Date(order.createdAt);
      let periodKey: string;

      if (period === "day") {
        periodKey = date.toISOString().split('T')[0];
      } else if (period === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        periodKey = startOfWeek.toISOString().split('T')[0];
      } else {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!periodicData[periodKey]) {
        periodicData[periodKey] = { orders: 0, revenue: 0 };
      }

      periodicData[periodKey].orders += 1;
      if (["paid", "shipped", "completed", "delivered", "confirmed", "processing", "pending"].includes(order.status)) {
        periodicData[periodKey].revenue += order.totalAmount;
      }
    });

    console.log(`[PeriodicAnalytics] Grouped data for period ${period}:`, JSON.stringify(periodicData));

    return Object.entries(periodicData).map(([key, data]) => ({
      period: key,
      orders: data.orders,
      revenue: data.revenue,
      aov: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getDailyAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<{ date: string; orders: number; revenue: number }[]>{
    const analytics = await this.getPeriodicAnalytics("day", filters);
    console.log(`[Analytics] Daily analytics returned ${analytics.length} days of data`);
    return analytics.map(a => ({ date: a.period, orders: a.orders, revenue: a.revenue }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
  }

  async getAuditLogsPaginated(filters?: { page?: number; limit?: number; actionType?: string }): Promise<PaginatedResult<AuditLog>> {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 50));
    const offset = (page - 1) * limit;

    let allLogs: AuditLog[];
    if (filters?.actionType) {
      allLogs = await db.select().from(auditLogs)
        .where(eq(auditLogs.actionType, filters.actionType))
        .orderBy(desc(auditLogs.timestamp));
    } else {
      allLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
    }

    const total = allLogs.length;
    const data = allLogs.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async getDashboardOverview(filters?: { startDate?: string; endDate?: string }): Promise<any> {
    const allOrders = await db.select().from(orders);

    let filteredOrders = allOrders;
    if (filters?.startDate || filters?.endDate) {
      console.log(`[Dashboard] Filtering orders from ${filters.startDate} to ${filters.endDate}`);
      filteredOrders = allOrders.filter(o => {
        const date = new Date(o.createdAt);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
      });
      console.log(`[Dashboard] Found ${filteredOrders.length} orders in filtered range`);
    }

    const totalOrders = filteredOrders.length;
    const paidOrdersList = filteredOrders.filter(o => ["paid", "shipped", "completed", "delivered", "confirmed", "processing", "pending"].includes(o.status));
    const paidOrders = paidOrdersList.length;
    const pendingOrders = filteredOrders.filter(o => o.status === "pending").length;

    const totalRevenue = paidOrdersList.reduce((sum, o) => sum + o.totalAmount, 0);

    const chartData = await this.getDailyAnalytics(filters);

    console.log(`[Dashboard] Stats: Total=${totalOrders}, Paid=${paidOrders}, Pending=${pendingOrders}, Revenue=${totalRevenue}`);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue,
      chartData
    };
  }

  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.order), desc(videos.createdAt));
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }
}

export const storage = new DatabaseStorage();
