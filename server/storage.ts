import { db } from "./db";
import { products, admins, orders, auditLogs, videos, siteVisitors, type Product, type InsertProduct, type Admin, type InsertAdmin, type Order, type InsertOrder, type AuditLog, type InsertAuditLog, type Video, type InsertVideo, type SiteVisitor, type InsertSiteVisitor } from "@shared/schema";
import { eq, like, and, desc, gte, lte, or, count, countDistinct } from "drizzle-orm";

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
  getAdminStats(filters?: { startDate?: string; endDate?: string }): Promise<any>;
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

  // Visitor tracking
  trackVisitor(visitor: InsertSiteVisitor): Promise<SiteVisitor>;
  getVisitorStats(filters?: { startDate?: string; endDate?: string }): Promise<{ totalVisitors: number; uniqueVisitors: number }>;

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

      if (nextStatus === "confirmed" && oldStatus !== "confirmed") {
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
              await tx.insert(auditLogs).values({
                action: `Stock Deducted: ${product.name} (${item.storage || item.color}) x${item.quantity}`,
                adminEmail: "system",
                actionType: "stock_deduction",
                targetType: "Product",
                targetId: product.id,
                previousValue: prevStock?.toString(),
                newValue: newStock?.toString(),
              }).catch(err => console.error("Audit log failed:", err));
            }
          }
        }
      }

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
      currentPeriodOrders = allOrders.filter(o => {
        const date = new Date(o.createdAt);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
      });
    }

    const paidStatuses = ["paid", "shipped", "completed", "delivered", "confirmed", "processing", "pending"];
    const totalOrders = currentPeriodOrders.length;
    const paidOrders = currentPeriodOrders.filter(o => paidStatuses.includes(o.status));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const visitorStats = await this.getVisitorStats(filters);
    const [totalAdmins] = await db.select({ value: count() }).from(admins);

    return {
      totalOrders,
      totalRevenue,
      totalProducts: allProducts.length,
      pendingOrders: currentPeriodOrders.filter(o => o.status === "pending").length,
      totalVisitors: visitorStats.totalVisitors,
      uniqueVisitors: visitorStats.uniqueVisitors,
      totalAdmins: totalAdmins?.value || 0,
      recentOrders: [...currentPeriodOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
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

    return Object.entries(periodicData).map(([key, data]) => ({
      period: key,
      orders: data.orders,
      revenue: data.revenue,
      aov: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getDailyAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<{ date: string; orders: number; revenue: number }[]>{
    const analytics = await this.getPeriodicAnalytics("day", filters);
    return analytics.map(a => ({ date: a.period, orders: a.orders, revenue: a.revenue }));
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
    }

    const totalOrders = filteredOrders.length;
    const paidOrdersList = filteredOrders.filter(o => ["paid", "shipped", "completed", "delivered", "confirmed", "processing", "pending"].includes(o.status));
    const paidOrders = paidOrdersList.length;
    const pendingOrders = filteredOrders.filter(o => o.status === "pending").length;
    const totalRevenue = paidOrdersList.reduce((sum, o) => sum + o.totalAmount, 0);
    const chartData = await this.getDailyAnalytics(filters);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue,
      chartData
    };
  }

  async trackVisitor(visitor: InsertSiteVisitor): Promise<SiteVisitor> {
    const [newVisitor] = await db.insert(siteVisitors).values(visitor).returning();
    return newVisitor;
  }

  async getVisitorStats(filters?: { startDate?: string; endDate?: string }): Promise<{ totalVisitors: number; uniqueVisitors: number }> {
    let conditions = [];
    if (filters?.startDate) conditions.push(gte(siteVisitors.timestamp, new Date(filters.startDate)));
    if (filters?.endDate) conditions.push(lte(siteVisitors.timestamp, new Date(filters.endDate)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await db.select({ value: count() }).from(siteVisitors).where(whereClause);
    const [uniqueRes] = await db.select({ value: countDistinct(siteVisitors.visitorId) }).from(siteVisitors).where(whereClause);

    return {
      totalVisitors: Number(totalRes?.value || 0),
      uniqueVisitors: Number(uniqueRes?.value || 0)
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
