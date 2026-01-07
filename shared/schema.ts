import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Store in RWF
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  stockStatus: text("stock_status").notNull().default("in_stock"), // in_stock, out_of_stock, pre_order
  isFeatured: boolean("is_featured").default(false),
  specs: jsonb("specs").$type<Record<string, string>>(), // Key-value pairs for specs
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

// Types for API
export type ProductResponse = Product;
