"use client";

import React from "react";
import { 
  Heart, 
  Wind, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  AlertTriangle
} from "lucide-react";

interface HealthAlertProps {
  aqi: number;
  pm25: number;
  ville: string;
  niveau: string; 
}

const getAqiConfig = (aqi: number) => {
  if (aqi <= 50) return {
    label: "Bon",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800/30",
    icon: <CheckCircle2 className="w-6 h-6" />,
    advice: "La qualité de l'air est satisfaisante. Profitez de vos activités en extérieur au Cameroun.",
    precautions: ["Aération normale", "Sport recommandé", "Aucun risque"]
  };
  if (aqi <= 100) return {
    label: "Modéré",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800/30",
    icon: <Info className="w-6 h-6" />,
    advice: "Qualité acceptable. Les personnes ultra-sensibles devraient limiter les efforts prolongés.",
    precautions: ["Limiter sport intensif", "Surveiller les enfants", "Aérer tôt le matin"]
  };
  if (aqi <= 150) return {
    label: "Médiocre",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800/30",
    icon: <AlertTriangle className="w-6 h-6" />,
    advice: "Les membres des groupes sensibles peuvent ressentir des effets sur la santé.",
    precautions: ["Port du masque suggéré", "Eviter les zones de trafic", "Rester hydraté"]
  };
  if (aqi <= 200) return {
    label: "Mauvais",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800/30",
    icon: <ShieldAlert className="w-6 h-6" />,
    advice: "Tout le monde peut commencer à ressentir des effets. Risque sérieux pour les sensibles.",
    precautions: ["Masque obligatoire", "Activités intérieures", "Prendre ses médicaments"]
  };
  return {
    label: "Très Mauvais / Dangereux",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800/30",
    icon: <ShieldAlert className="w-6 h-6" />,
    advice: "Avertissement sanitaire d'urgence. Toute la population est susceptible d'être affectée.",
    precautions: ["Confinement recommandé", "Purificateur d'air", "Urgence médicale possible"]
  };
};

export function HealthAlertCard({ aqi, pm25, ville, niveau }: HealthAlertProps) {
  const config = getAqiConfig(aqi);

  return (
    <div className={`glass-card p-5 md:p-6 border-l-4 ${config.borderColor} ${config.bgColor} transition-all animate-fade-in`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${config.bgColor} ${config.color}`}>
              {config.icon}
            </span>
            <h3 className="font-black text-xl tracking-tight">Santé & Air : {ville}</h3>
          </div>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Statut basé sur les dernières prédictions IA
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-4xl font-black ${config.color}`}>{aqi}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Index AQI (PM2.5)</div>
          </div>
          <div className={`h-12 w-1 border-r ${config.borderColor}`} />
          <div className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
             <span className={`text-sm font-black uppercase ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card p-4 bg-white/40 dark:bg-slate-950/40 border-none shadow-none">
            <h4 className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
               <Info className="w-3 h-3" /> Note du système
            </h4>
            <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-200 uppercase tracking-tighter">
              {config.advice}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500" /> Actions de Résilience
          </h4>
          <div className="flex flex-wrap gap-2">
            {config.precautions.map((item, i) => (
              <span key={i} className="px-3 py-1 rounded-md bg-white dark:bg-slate-900/60 text-[11px] font-bold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${config.color.split(' ')[0].replace('text', 'bg')}`} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
