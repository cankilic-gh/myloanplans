"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TrustSignals } from "@/components/landing/TrustSignals";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== "undefined") {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated");
      
      if (isAuthenticated === "true") {
        router.push("/dashboard");
        return;
      }
    }
    setIsChecking(false);
  }, [router]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </main>
    );
  }

  // JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "My Loan Plans",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Turn financial chaos into a clear plan. Track all your loans, optimize payments, and see exactly when you'll be debt-free.",
    url: "https://myloanplans.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    featureList: [
      "Real-time loan calculations",
      "Amortization schedules",
      "Payment optimization",
      "Multi-loan tracking",
      "Visual insights and charts",
      "Income and expense tracking",
      "Budget management",
      "Recurring expense automation",
    ],
  };

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <TrustSignals />
          <CTA />
        </main>
        <Footer />
        <AuthModal />
      </div>
    </>
  );
}

