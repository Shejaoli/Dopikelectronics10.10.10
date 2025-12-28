import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CheckCircle2 } from "lucide-react";
import aboutImg from "/images/569057804_1496300854828703_4965950891284723221_n_1766945239895.jpg"; // Using uploaded asset structure

export default function About() {
  const stats = [
    { label: "Years in Business", value: "5+" },
    { label: "Happy Customers", value: "10k+" },
    { label: "Products Sold", value: "15k+" },
    { label: "Support", value: "24/7" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <WhatsAppFloat />

      {/* Hero */}
      <div className="relative overflow-hidden bg-card py-20">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">About DOPIK</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Rwanda's Premier Destination for Premium Electronics
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
               <img 
                 src={aboutImg} 
                 alt="Store Interior" 
                 className="h-full w-full object-cover opacity-80"
                 onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000";
                 }}
               />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Who We Are</h2>
              <p className="text-lg text-muted-foreground">
                DOPIK ELECTRONICS is the leading electronics shop in Kigali, Rwanda. Located at KN 48 St, we specialize in bringing you the latest and most reliable gadgets from top global brands.
              </p>
              <p className="text-lg text-muted-foreground">
                Our slogan, <span className="text-primary italic">"Where Gadgets Meet Great Deals"</span>, reflects our commitment to offering premium quality products at competitive prices. Whether you need the latest iPhone, professional audio gear, or essential accessories, we have you covered.
              </p>
              
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  "Official Warranties",
                  "Expert Technical Advice",
                  "Original Products Only",
                  "After-sales Support",
                  "Delivery Across Rwanda",
                  "Secure Payments"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 rounded-3xl bg-white/5 p-8 text-center sm:grid-cols-4 lg:p-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
