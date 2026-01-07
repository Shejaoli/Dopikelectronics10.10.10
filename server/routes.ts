import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./auth";

declare module "express-session" {
  interface SessionData {
    adminId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
    const products = await storage.getProducts({ category, featured, search });
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  // Seed data endpoint (internal use or auto-run)
  await seedDatabase();

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
}
