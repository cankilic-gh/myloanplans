import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MyLoanPlans | Financial Planning Tool",
    template: "%s | MyLoanPlans",
  },
  description: "Comprehensive financial super app combining mortgage calculator and budget management. Estimate monthly payments, track expenses, and achieve your financial goals.",
  keywords: ["mortgage calculator", "loan planning", "budget tracker", "financial planning", "amortization", "interest rates"],
  authors: [{ name: "Can Kilic" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.myloanplans.com/",
    siteName: "MyLoanPlans",
    title: "MyLoanPlans | Financial Planning Tool",
    description: "Comprehensive financial super app for mortgage calculation and budget management.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLoanPlans | Financial Planning Tool",
    description: "Comprehensive financial super app for mortgage calculation and budget management.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
