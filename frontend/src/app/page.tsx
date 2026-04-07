import Link from "next/link";
import { ArrowRight, Wind, ShieldAlert, LineChart, Map as MapIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12 pb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">
          Respirez un Air Pur
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-300">
          Plateforme IA avancee de prediction et de surveillance de la qualite de l&apos;air au Cameroun. 
          Protegez votre sante avec nos donnees en temps reel.
        </p>
        <div className="flex justify-center gap-4 pt-4 flex-wrap">
          <Link href="/dashboard" className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-blue-500/30">
            Tableau de bord <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/map" className="px-6 py-3 rounded-full glass-card border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 transition-transform hover:scale-105">
            Explorer la carte <MapIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6 pt-8">
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-blue-500 transition-colors">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <LineChart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Predictions IA</h3>
          <p className="text-slate-600 dark:text-slate-400 scale-95">
            Notre modele XGBoost/Random Forest analyse les donnees meteorologiques pour predire precisement la pollution aux particules fines (PM2.5).
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-orange-500 transition-colors">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Alertes Sante</h3>
          <p className="text-slate-600 dark:text-slate-400 scale-95">
            Recevez des alertes en temps reel quand la qualite de l&apos;air se degrade au-dela des seuils critiques dans votre ville.
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-teal-500 transition-colors">
          <div className="p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-600 dark:text-teal-400">
            <Wind className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Couverture Nationale</h3>
          <p className="text-slate-600 dark:text-slate-400 scale-95">
            Surveillance de plus de 40 villes camerounaises a travers les 10 regions avec des visualisations geographiques interactives.
          </p>
        </div>
      </section>
    </div>
  );
}
