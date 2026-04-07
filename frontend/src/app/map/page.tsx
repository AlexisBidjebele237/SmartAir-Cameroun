"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getMapData } from "@/services/api";
import { MapPin, Zap, ZapOff, Search, ChevronRight } from "lucide-react";

// Import dynamique pour eviter le rendu cote serveur de Leaflet
const MapWithNoSSR = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-[450px] md:h-[600px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center"><p className="text-slate-400">Chargement de la carte...</p></div>
});

export default function MapPage() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFrugal, setIsFrugal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    getMapData()
      .then((data) => {
        if (mounted) setMapData(data.marqueurs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCities = mapData.filter(city => 
    city.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10 flex flex-col h-full min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter">
            <MapPin className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
            Réseau National
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl">
            Surveillance géographique en temps réel sur 40+ villes du Cameroun. 
          </p>
        </div>

        <button 
          onClick={() => setIsFrugal(!isFrugal)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
            isFrugal 
              ? "bg-amber-500 text-white shadow-amber-500/20" 
              : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          }`}
        >
          {isFrugal ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          {isFrugal ? "Mode Normal" : "Mode Frugal (Éco)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
        {/* Left Sidebar: City Selector */}
        <div className="lg:col-span-1 space-y-4 flex flex-col h-full max-h-[600px]">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm shadow-sm"
            />
          </div>

          <div className="flex-grow overflow-y-auto glass-card p-2 space-y-1 custom-scrollbar scroll-smooth">
            {filteredCities.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic text-sm">Aucune ville trouvée</div>
            )}
            {filteredCities.map((city, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedCity(city)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border ${
                  selectedCity?.ville === city.ville 
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm" 
                    : "border-transparent"
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-sm tracking-tight">{city.ville}</div>
                  <div className="text-[10px] uppercase font-black text-slate-400">{city.region}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: city.couleur }} />
                  <ChevronRight className={`w-4 h-4 text-slate-300 ${selectedCity?.ville === city.ville ? "text-blue-500 translate-x-1" : ""}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Map or Frugal List */}
        <div className="lg:col-span-3 min-h-[450px] md:min-h-[600px] flex flex-col">
          {isFrugal ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in overflow-y-auto max-h-[600px] pr-2">
              {filteredCities.map((city, idx) => (
                <div key={idx} className="glass-card p-4 flex items-center justify-between border-l-4" style={{ borderColor: city.couleur }}>
                  <div className="space-y-0.5">
                    <h3 className="font-black text-base">{city.ville}</h3>
                    <p className="text-xs text-slate-500 font-medium">PM2.5: <b className="text-slate-900 dark:text-slate-100">{city.pm25} µg/m³</b></p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Réseau Local</span>
                    <div className="font-black text-sm" style={{ color: city.couleur }}>AQI {city.pm25 + 10}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow shadow-2xl rounded-2xl overflow-hidden border border-white/20 dark:border-slate-800">
              <MapWithNoSSR mapData={mapData} selectedPoint={selectedCity} />
            </div>
          )}
        </div>
      </div>

      {/* Responsive Legend */}
      <div className="glass-card p-4 flex flex-wrap gap-4 md:gap-8 items-center justify-center text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Faible</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Modéré</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f97316]"></span> Dangereux</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Critique</span>
      </div>
    </div>
  );
}

