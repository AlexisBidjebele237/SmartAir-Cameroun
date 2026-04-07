"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CloudRain, Menu, X, Landmark } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Tableau de bord", href: "/dashboard" },
  { name: "Carte", href: "/map" },
  { name: "Predictions", href: "/predictions" },
  { name: "Alertes", href: "/alerts" },
  { name: "Impact", href: "/impact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b-0 rounded-none border-x-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                <CloudRain className="w-6 h-6 outline-none" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">SMARTAIR CAMEROON</span>
              <span className="font-bold text-xl tracking-tight sm:hidden">SMARTAIR</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isActive ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-card rounded-none border-x-0 absolute w-full left-0 mt-1 pb-4 px-4 shadow-xl flex flex-col space-y-1 animate-fade-in">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-bold ${
                  isActive
                    ? "bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
