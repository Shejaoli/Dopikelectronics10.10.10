import { db } from "./db";
import { products, admins, orders, type Product, type InsertProduct, type Admin, type InsertAdmin, type Order, type InsertOrder } from "@shared/schema";
import { eq, like, and, desc } from "drizzle-orm";

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
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getProductByNameAndBrand(name: string, brand: string): Promise<Product | undefined>;
  getAdminStats(): Promise<{ totalOrders: number; totalRevenue: number; totalProducts: number; pendingOrders: number }>;
  getDailyAnalytics(): Promise<{ date: string; orders: number; revenue: number }[]>;
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

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
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

    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status));
    }

    if (filters?.startDate) {
      conditions.push(and(
        // @ts-ignore
        orders.createdAt >= new Date(filters.startDate)
      ));
    }

    if (filters?.endDate) {
      conditions.push(and(
        // @ts-ignore
        orders.createdAt <= new Date(filters.endDate)
      ));
    }

    // Use drizzle's gte/lte if available, but since I'm in fast mode and want to be sure:
    // Actually better to use proper drizzle operators
    const { gte, lte, or } = require("drizzle-orm");
    
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

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    if (!updatedOrder) throw new Error("Order not found");
    return updatedOrder;
  }

  async getProductByNameAndBrand(name: string, brand: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.name, name), eq(products.brand, brand)));
    return product;
  }

  async getAdminStats(): Promise<{ totalOrders: number; totalRevenue: number; totalProducts: number; pendingOrders: number }> {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    
    const totalOrders = allOrders.length;
    const totalProducts = allProducts.length;
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;
    const totalRevenue = allOrders
      .filter(o => o.status === "paid" || o.status === "delivered")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { totalOrders, totalRevenue, totalProducts, pendingOrders };
  }

  async getDailyAnalytics(): Promise<{ date: string; orders: number; revenue: number }[]>{
    const allOrders = await db.select().from(orders);
    
    // Group by date
    const dailyData: Record<string, { orders: number; revenue: number }> = {};
    
    allOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, revenue: 0 };
      }
      
      dailyData[date].orders += 1;
      if (order.status === "paid" || order.status === "delivered") {
        dailyData[date].revenue += order.totalAmount;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const storage = new DatabaseStorage();
