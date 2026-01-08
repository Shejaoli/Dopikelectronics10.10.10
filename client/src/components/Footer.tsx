import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              DOPIK <span className="text-primary">ELECTRONICS</span>
            </h3>
            <p className="text-muted-foreground">
              Where Gadgets Meet Great Deals. Your premium destination for the latest electronics in Kigali.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/dopik.electronics" target="_blank" className="rounded-full bg-accent p-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-accent p-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-accent p-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/"><span className="cursor-pointer text-muted-foreground hover:text-primary">Home</span></Link></li>
              <li><Link href="/shop"><span className="cursor-pointer text-muted-foreground hover:text-primary">Shop Now</span></Link></li>
              <li><Link href="/about"><span className="cursor-pointer text-muted-foreground hover:text-primary">About Us</span></Link></li>
              <li><Link href="/contact"><span className="cursor-pointer text-muted-foreground hover:text-primary">Contact</span></Link></li>
              <li><Link href="/admin/login"><span className="cursor-pointer text-muted-foreground hover:text-primary">Admin Login</span></Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-6 text-lg font-bold text-foreground">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span>KN 48 St, Kigali, Rwanda<br/>(Code: 3335+6Q Kigali)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span>+250 783 562 143</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate">dopikelectronics@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-foreground">Business Hours</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex justify-between">
                <span>Mon - Fri:</span>
                <span className="text-foreground">8:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-foreground">9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-foreground">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DOPIK ELECTRONICS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
