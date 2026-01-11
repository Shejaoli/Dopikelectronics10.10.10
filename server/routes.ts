import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { hashPassword, verifyPassword, requireAdminAuth } from "./auth";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from "express";

const storage_config = multer.diskStorage({
  destination: "./public/uploads/products/",
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png and .webp formats allowed!"));
    }
  },
});

declare module "express-session" {
  interface SessionData {
    adminId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", express.static("public/uploads"));

  app.post("/api/upload", requireAdminAuth, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/products/${req.file.filename}`;
      res.status(200).json({ url: imageUrl });
    });
  });

  app.get("/api/admin/protected", requireAdminAuth, (req, res) => {
    res.json({ message: "Access granted: You are an authenticated admin", adminId: req.session.adminId });
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, admin.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      const { passwordHash: _, ...adminInfo } = admin;
      res.json(adminInfo);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/me", async (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getAdminById(req.session.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const { passwordHash: _, ...adminInfo } = admin;
    res.json(adminInfo);
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.sendStatus(200);
    });
  });

  app.get(api.products.list.path, async (req, res) => {
    const category = req.query.category as string;
    const featured = req.query.featured === 'true';
    const search = req.query.search as string;
    const stockStatus = req.query.stockStatus as string;
    const products = await storage.getProducts({ category, featured, search, stockStatus });
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.patch("/api/products/:id", requireAdminAuth, express.json(), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const admin = await storage.getAdminById(req.session.adminId!);
      if (admin?.role === "staff") {
        return res.status(403).json({ message: "Staff cannot edit products" });
      }
      const data = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(id, data);
      await storage.createAuditLog({
        action: `Product Edited: ${updated.name}`,
        adminEmail: admin?.email || "unknown"
      });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.post("/api/products", requireAdminAuth, express.json(), async (req, res) => {
    try {
      const admin = await storage.getAdminById(req.session.adminId!);
      if (admin?.role === "staff") {
        return res.status(403).json({ message: "Staff cannot create products" });
      }
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      await storage.createAuditLog({
        action: `Product Created: ${product.name}`,
        adminEmail: admin?.email || "unknown"
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const admin = await storage.getAdminById(req.session.adminId!);
      if (admin?.role === "staff") {
        return res.status(403).json({ message: "Staff cannot delete products" });
      }
      const id = Number(req.params.id);
      const product = await storage.getProduct(id);
      await storage.deleteProduct(id);
      await storage.createAuditLog({
        action: `Product Deleted: ${product?.name || id}`,
        adminEmail: admin?.email || "unknown"
      });
      res.sendStatus(200);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Product not found" });
    }
  });

  app.get("/api/orders/:id", requireAdminAuth, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.get("/api/admin/audit-logs", requireAdminAuth, async (_req, res) => {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });

  app.get("/api/orders", requireAdminAuth, async (req, res) => {
    try {
      const { search, status, startDate, endDate } = req.query;
      const orders = await storage.getOrders({ 
        search: search as string, 
        status: status as string, 
        startDate: startDate as string, 
        endDate: endDate as string 
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      
      // Calculate total amount from items to ensure accuracy
      const items = data.items || [];
      const calculatedTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      
      const order = await storage.createOrder({
        ...data,
        totalAmount: calculatedTotal
      });
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid order data" });
    }
  });

  app.patch("/api/orders/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const validStatuses = ["pending", "paid", "delivered", "cancelled"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateOrderStatus(id, status);
      const admin = await storage.getAdminById(req.session.adminId!);
      await storage.createAuditLog({
        action: `Order Status Updated: Order #${id} to ${status}`,
        adminEmail: admin?.email || "unknown"
      });
      res.json(updated);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : "Order not found" });
    }
  });

  app.post("/api/admin/products/import", requireAdminAuth, express.json({ limit: '10mb' }), async (req, res) => {
    try {
      const items = z.array(insertProductSchema).parse(req.body);
      let importedCount = 0;
      let skippedCount = 0;

      for (const item of items) {
        const existing = await storage.getProductByNameAndBrand(item.name, item.brand);
        if (!existing) {
          await storage.createProduct(item);
          importedCount++;
        } else {
          skippedCount++;
        }
      }

      res.json({ message: `Import successful: ${importedCount} products imported, ${skippedCount} skipped.`, importedCount, skippedCount });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid import data" });
    }
  });

  app.get("/api/admin/stats", requireAdminAuth, async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/analytics", requireAdminAuth, async (_req, res) => {
    try {
      const analytics = await storage.getDailyAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Seed data logic protected to only run if database is empty
  try {
    const existingProducts = await storage.getProducts();
    const existingAdmins = await storage.getAdminByEmail("admin@dopik.com");
    
    if (existingProducts.length === 0 || !existingAdmins) {
      console.log("Database empty or missing admin, running seed logic...");
      await seedDatabase();
    } else {
      console.log("Database already initialized, skipping seed.");
    }
  } catch (error) {
    console.error("Error checking database status during startup:", error);
    // Attempt to seed anyway if check fails (might be first run with empty tables)
    await seedDatabase();
  }

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProducts();
  if (existing.length === 0) {
    const seedProducts = [
      {
        name: "iPhone 17 Pro Max",
        description: "The ultimate iPhone. Titanium design, A19 Pro chip, and the most advanced camera system ever in an iPhone.",
        price: 1800000,
        category: "Smartphones",
        brand: "Apple",
        imageUrl: "/images/iphone-17-pro-max-1.png",
        stockStatus: "pre_order",
        isFeatured: true,
        specs: { "Storage": "256GB/512GB/1TB", "Chip": "A19 Pro", "Display": "6.9-inch Super Retina XDR" }
      },
      {
        name: "Soundcore Liberty 4 NC",
        description: "Reduce noise by up to 98.5% with our advanced noise cancelling system. Crisp sound and long battery life.",
        price: 120000,
        category: "Audio",
        brand: "Soundcore",
        imageUrl: "/images/soundcore-liberty-4.jpg",
        stockStatus: "in_stock",
        isFeatured: true,
        specs: { "Battery": "10H/50H", "ANC": "Adaptive ANC 2.0", "Codec": "LDAC" }
      },
      {
        name: "Beats Pill",
        description: "Portable wireless speaker with room-filling sound. Designed for life on the go.",
        price: 250000,
        category: "Audio",
        brand: "Beats",
        imageUrl: "/images/beats-pill.jpg",
        stockStatus: "in_stock",
        isFeatured: true,
        specs: { "Battery": "Up to 24 hours", "Connectivity": "Bluetooth & USB-C", "Water Resistance": "IP67" }
      },
      {
        name: "UGREEN 6-in-1 USB-C Hub",
        description: "Expand your connectivity with HDMI 4K, USB 3.0, SD Card reader and PD charging.",
        price: 65000,
        category: "Accessories",
        brand: "UGREEN",
        imageUrl: "/images/ugreen-adapter.jpg",
        stockStatus: "in_stock",
        isFeatured: false,
        specs: { "Ports": "HDMI, 3x USB 3.0, SD/TF", "Power": "100W PD" }
      },
      {
        name: "Saramonic Blink 500",
        description: "Ultracompact 2.4GHz Dual-Channel Wireless Microphone System for Cameras and Mobile Devices.",
        price: 280000,
        category: "Creator Gear",
        brand: "Saramonic",
        imageUrl: "/images/saramonic-mic.jpg",
        stockStatus: "in_stock",
        isFeatured: true,
        specs: { "Range": "100m", "Channels": "Dual", "Battery": "Built-in" }
      },
      {
        name: "iPhone 16",
        description: "Dynamic Island, 48MP Main camera, and USB-C. A total powerhouse.",
        price: 1200000,
        category: "Smartphones",
        brand: "Apple",
        imageUrl: "/images/iphone-16.png",
        stockStatus: "in_stock",
        isFeatured: true,
        specs: { "Storage": "128GB/256GB", "Chip": "A18", "Display": "6.1-inch Super Retina XDR" }
      }
    ];

    for (const product of seedProducts) {
      // @ts-ignore - Specs type compatibility for seed data
      await storage.createProduct(product);
    }
  }

  // Seed Admin
  const adminEmail = "admin@dopik.com";
  const existingAdmin = await storage.getAdminByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createAdmin({
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "admin"
    });
  }

  // Seed Orders if none exist
  const existingOrders = await storage.getOrders();
  if (existingOrders.length === 0) {
    const seedOrders = [
      {
        customerName: "Jean Paul",
        customerPhone: "0788123456",
        totalAmount: 1800000,
        status: "pending",
      },
      {
        customerName: "Marie Claire",
        customerPhone: "0788654321",
        totalAmount: 120000,
        status: "paid",
      },
    ];
    for (const order of seedOrders) {
      await storage.createOrder(order);
    }
  }
}
