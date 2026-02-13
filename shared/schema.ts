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
  additionalImages: text("additional_images").array().default([]),
  stockStatus: text("stock_status").notNull().default("in_stock"), // in_stock, out_of_stock, pre_order
  isFeatured: boolean("is_featured").default(false),
  specs: jsonb("specs").$type<Record<string, string>>(), // Key-value pairs for specs
  variations: jsonb("variations").$type<{
    storage?: { option: string; priceOffset: number; stock?: number }[];
    colors?: { name: string; value: string; stock?: number }[];
  }>(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"), // admin, staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  adminEmail: text("admin_email").notNull(),
  actionType: text("action_type").notNull().default("unknown"), // "status_change", "stock_deduction", "stock_restoration"
  targetType: text("target_type").notNull().default("unknown"), // "Order", "Product"
  targetId: integer("target_id").notNull().default(0),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryLocation: text("delivery_location"),
  paymentMethod: text("payment_method"),
  paymentProvider: text("payment_provider"), // stripe, paypal, manual
  paymentReference: text("payment_reference"), // stripe intent id or paypal order id
  totalAmount: integer("total_amount").notNull(),
  currency: text("currency").default("RWF").notNull(),
  status: text("status").notNull().default("pending"),
  items: jsonb("items").$type<{ productId: number; name: string; quantity: number; price: number; storage?: string; color?: string }[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  originalUrl: text("original_url"),
  mimeType: text("mime_type").notNull().default("video/mp4"),
  fileSize: integer("file_size").notNull().default(0),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isCompressed: boolean("is_compressed").default(false).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteVisitors = pgTable("site_visitors", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(), // Session-based or persistent ID
  path: text("path").notNull(),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSiteVisitorSchema = createInsertSchema(siteVisitors).omit({ id: true, timestamp: true });
export type SiteVisitor = typeof siteVisitors.$inferSelect;
export type InsertSiteVisitor = z.infer<typeof insertSiteVisitorSchema>;

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });
export const auditLogSchema = auditLogs;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

// Types for API
export type ProductResponse = Product;
