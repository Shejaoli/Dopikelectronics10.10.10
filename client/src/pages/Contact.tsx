import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <WhatsAppFloat />

      <div className="py-12 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
            <p className="mt-4 text-lg text-muted-foreground">We'd love to hear from you. Visit our store or send us a message.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            
            {/* Contact Info Cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Call Us</h3>
                <p className="text-muted-foreground">+250 783 562 143</p>
                <p className="text-muted-foreground">+250 789 527 746</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Email Us</h3>
                <p className="text-muted-foreground break-words">dopikelectronics@gmail.com</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 sm:col-span-2">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Visit Our Store</h3>
                <p className="text-muted-foreground">
                  KN 48 St, Kigali, Rwanda <br />
                  Google Maps Code: 3335+6Q Kigali
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 sm:col-span-2">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Opening Hours</h3>
                <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    <p className="text-foreground font-medium">Monday - Friday</p>
                    <p>8:00 AM - 8:00 PM</p>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Saturday</p>
                    <p>9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder or Form */}
            <div className="rounded-3xl border border-border bg-card p-2 overflow-hidden h-[400px] lg:h-auto">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.532736173456!2d30.058!3d-1.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTcnMDAuMCJTIDMwwrAwMycwMC4wIkU!5e0!3m2!1sen!2srw!4v1620000000000!5m2!1sen!2srw" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0, borderRadius: '1rem' }} 
                 allowFullScreen 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
