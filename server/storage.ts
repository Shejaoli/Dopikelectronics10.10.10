import { db } from "./db";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { eq, like, and } from "drizzle-orm";

export interface IStorage {
  getProducts(filters?: { category?: string; featured?: boolean; search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { category?: string; featured?: boolean; search?: string }): Promise<Product[]> {
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
}

export const storage = new DatabaseStorage();
