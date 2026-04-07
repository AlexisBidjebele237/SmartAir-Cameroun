import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMARTAIR CAMEROON",
  description: "Plateforme IA de prediction de la qualite de l'air au Cameroun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 animate-fade-in">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
