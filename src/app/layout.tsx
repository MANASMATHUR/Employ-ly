import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Employly - AI-Powered Job Matching & Web3 Networking",
  description: "Find your dream job with AI-powered matching, showcase your skills, and connect with opportunities using blockchain-verified payments.",
  keywords: ["jobs", "networking", "Web3", "blockchain", "AI", "career", "employment", "hiring"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Employly - Build Success",
    description: "AI-powered job matching meets Web3. Find roles that actually fit.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Employly - Build Success",
    description: "AI-powered job matching meets Web3. Find roles that actually fit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
