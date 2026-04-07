"use client";

import { useEffect, useState } from "react";
import { getStats, getAlerts, getCorrelations } from "@/services/api";
import { 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Wind, 
  BarChart3, 
  TrendingUp, 
  Thermometer,
  CloudRain,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { HealthAlertCard } from "@/components/dashboard/HealthAlertCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from "recharts";

interface GlobalStats {
  nombre_villes: number;
  nombre_regions: number;
  nombre_observations: number;
  moyenne_temperature_2m_mean: number;
  moyenne_wind_speed_10m_max: number;
  moyenne_precipitation_sum: number;
}

interface AlertSummary {
  total: number;
  critique: number;
  dangereux: number;
  modere: number;
  alertes: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [alerts, setAlerts] = useState<AlertSummary | null>(null);
  const [correlations, setCorrelations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, alertsData, corrData] = await Promise.all([
          getStats(),
          getAlerts(),
          getCorrelations()
        ]);
        setStats(statsData);
        setAlerts(alertsData);
        setCorrelations(corrData);
      } catch (error) {
        console.error("Erreur de chargement des donnees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Fonction locale utilitaire pour l'AQI (evite de dupliquer la logique du backend si on ne veut pas refetch)
  const calculer_aqi_local = (pm25: number) => {
    if (pm25 <= 12.0) return Math.round((50 / 12) * pm25);
    if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  };

  const COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-500 dark:text-slate-400">Analyses climat et qualite de l&apos;air au Cameroun.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-full animate-pulse-slow">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Reseau Live Monitoring</span>
          <span className="text-[10px] text-green-600/60 dark:text-green-400/60 ml-2">Maj: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Expert Health Alert Section */}
      {alerts?.alertes && alerts.alertes.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2 px-1">
            <Activity className="w-3 h-3 text-blue-500" /> Focus Santé Prioritaire
          </h2>
          <HealthAlertCard 
            aqi={calculer_aqi_local(alerts.alertes[0].pm25)} 
            pm25={alerts.alertes[0].pm25} 
            ville={alerts.alertes[0].ville}
            niveau={alerts.alertes[0].niveau}
          />
        </div>
      )}

      {/* Stats KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/map" className="glass-card p-6 flex flex-col gap-2 transition-all hover:scale-105 hover:shadow-xl hover:border-blue-500/50 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-500" /> Villes Surveillees
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-4xl font-bold tracking-tight">{stats?.nombre_villes || 0}</span>
          <div className="text-xs text-slate-400">{stats?.nombre_regions} regions couvertes</div>
        </Link>

        <Link href="/alerts" className="glass-card p-6 flex flex-col gap-2 border-l-4 border-l-red-500 transition-all hover:scale-105 hover:shadow-xl hover:bg-red-50/30 dark:hover:bg-red-900/10 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Alertes Critiques
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-4xl font-bold text-red-500 tracking-tight">{alerts?.critique || 0}</span>
          <div className="text-xs text-slate-400">Risque immediat PM2.5</div>
        </Link>

        <Link href="/alerts" className="glass-card p-6 flex flex-col gap-2 border-l-4 border-l-orange-500 transition-all hover:scale-105 hover:shadow-xl hover:bg-orange-50/30 dark:hover:bg-orange-900/10 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Niveau Dangereux
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-4xl font-bold text-orange-500 tracking-tight">{alerts?.dangereux || 0}</span>
          <div className="text-xs text-slate-400">Attention recommandee</div>
        </Link>

        <Link href="/predictions" className="glass-card p-6 flex flex-col gap-2 transition-all hover:scale-105 hover:shadow-xl hover:border-green-500/50 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-500" /> Observations IA
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-4xl font-bold tracking-tight">{(stats?.nombre_observations || 0).toLocaleString()}</span>
          <div className="text-xs text-slate-400">Analyses historiques</div>
        </Link>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Evolution */}
        <div className="glass-card p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> 
              Evolution Temporelle
            </h3>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correlations?.timeline} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fontSize: 9}} minTickGap={30} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="pm25" name="PM2.5" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temp" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Scatter */}
        <div className="glass-card p-4 md:p-6 space-y-4">
          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-500" /> 
            Climat vs Qualite de l&apos;Air
          </h3>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeOpacity={0.1} />
                <XAxis type="number" dataKey="temperature" name="temp" unit="°C" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis type="number" dataKey="pm25" name="pm" unit=" ug" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <ZAxis range={[20, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{fontSize: '10px'}} />
                <Scatter name="Donnees" data={correlations?.scatter} fill="#3b82f6" fillOpacity={0.5} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Regional Performance */}
        <div className="glass-card p-4 md:p-6 lg:col-span-2 space-y-4">
          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
            <Wind className="w-5 h-5 text-teal-500" /> 
            Pollution par Region
          </h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={correlations?.regions} layout="vertical" margin={{ left: -10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="region" axisLine={false} tickLine={false} tick={{fontSize: 9}} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px'}} />
                <Bar dataKey="pm25" name="PM2.5" radius={[0, 4, 4, 0]}>
                  {correlations?.regions.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.pm25 > 20 ? "#ef4444" : entry.pm25 > 14 ? "#f97316" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Matrix / Info */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" /> 
            Poids des Facteurs (Coeff.)
          </h3>
          <div className="space-y-4">
            {correlations?.correlations && Object.entries(correlations.correlations).map(([factor, value]: any) => (
              <div key={factor} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{factor}</span>
                  <span className={value > 0 ? "text-blue-500" : "text-slate-400"}>{(value * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${value > 0 ? "bg-blue-500" : "bg-slate-300"}`} 
                    style={{ width: `${Math.abs(value) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <b>Note IA :</b> La temperature et la radiation solaire présentent la plus forte correlation positive avec l&apos;indice PM2.5 au Cameroun.
            </p>
          </div>
        </div>
      </div>

      {/* Alertes Actives preview */}
      <div className="glass-card rounded-lg overflow-hidden lg:col-span-3">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> 
            Alertes Majeures Recentes
          </h2>
          <Link href="/alerts" className="text-blue-500 hover:underline text-sm font-medium">
            Voir tout
          </Link>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {alerts?.alertes && alerts.alertes.slice(0, 5).map((alerte, index) => (
             <div key={index} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
               <div className="flex flex-col">
                  <span className="font-bold text-lg">{alerte.ville}</span>
                  <span className="text-sm text-slate-500">{alerte.region} - {alerte.date.split(" ")[0]}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="font-bold flex items-center gap-1" style={{color: alerte.couleur}}>
                     {alerte.pm25} <span className="text-xs font-normal">ug/m³</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 mt-1 border" style={{borderColor: alerte.couleur, color: alerte.couleur}}>
                     {alerte.niveau}
                  </span>
               </div>
             </div>
          ))}
          {(!alerts?.alertes || alerts.alertes.length === 0) && (
            <div className="p-8 text-center text-slate-500 italic">
              Aucune alerte active identifiée par les modèles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
