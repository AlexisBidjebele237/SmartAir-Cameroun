"use client";

import { useEffect, useState } from "react";
import { getAlerts } from "@/services/api";
import { AlertOctagon, Info, ShieldAlert, Wind } from "lucide-react";

export default function AlertsPage() {
  const [alertsSummary, setAlertsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then((data) => setAlertsSummary(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const alertes = alertsSummary?.alertes || [];
  
  // Filtrer les alertes pour ne montrer que modere, dangereux et critique
  const alertesFiltrees = alertes.filter((a: any) => a.niveau !== "faible");

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-orange-500" />
          Centre d&apos;Alertes
        </h1>
      </div>

      <p className="text-slate-600 dark:text-slate-400">
        Surveillance en temps reel des niveaux de qualite de l&apos;air au Cameroun. Les alertes sont declenchees 
        lorsque le proxy PM2.5 depasse les seuils de securite de l&apos;OMS.
      </p>

      {alertesFiltrees.length === 0 ? (
        <div className="glass-card p-8 md:p-12 text-center flex flex-col items-center gap-4 border-l-4 border-l-green-500">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex justify-center items-center">
            <Wind className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Qualite de l&apos;air optimale</h2>
          <p className="text-sm md:text-base text-slate-500">
            Aucune alerte n&apos;est actuellement active sur le reseau national surveille.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alertesFiltrees.map((alerte: any, index: number) => (
            <div 
              key={index} 
              className="glass-card p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 border-l-4 transition-transform hover:shadow-lg"
              style={{ borderLeftColor: alerte.couleur }}
            >
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg md:text-2xl font-bold">{alerte.ville}</h3>
                      <span className="text-[10px] md:text-sm px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {alerte.region}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px] md:text-sm mt-1">{alerte.date}</p>
                  </div>
                  <div className="text-right">
                    <span 
                      className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${alerte.couleur}20`, color: alerte.couleur }}
                    >
                      {alerte.niveau}
                    </span>
                    <p className="text-lg md:text-2xl font-black mt-1" style={{ color: alerte.couleur }}>
                      {alerte.pm25} <span className="text-xs md:text-base font-normal text-slate-500 tracking-tighter">ug/m³</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-xl flex items-start gap-3 md:gap-4">
                  <Info className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5" style={{ color: alerte.couleur }} />
                  <div>
                    <h4 className="text-[10px] md:text-sm font-bold uppercase text-slate-400 mb-1">Recommandation</h4>
                    <p className="text-xs md:text-base text-slate-600 dark:text-slate-300 leading-snug">{alerte.recommandation}</p>
                  </div>
                </div>

                <div className="flex gap-4 md:gap-6 text-[10px] md:text-sm text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">Temp: <b className="text-slate-700 dark:text-slate-200">{alerte.temperature}C</b></span>
                  <span className="flex items-center gap-1">Vent: <b className="text-slate-700 dark:text-slate-200">{alerte.vent}km/h</b></span>
                  <span className="flex items-center gap-1">Pluie: <b className="text-slate-700 dark:text-slate-200">{alerte.pluie}mm</b></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
