"use client";

import { useState } from "react";
import { predictPollution, getCurrentWeather } from "@/services/api";
import { Calculator, Thermometer, Wind, CloudRain, Sun, Activity, RefreshCw, Info, TrendingUp, HelpCircle } from "lucide-react";
import { HealthAlertCard } from "@/components/dashboard/HealthAlertCard";

export default function PredictionsPage() {
  const [formData, setFormData] = useState({
    ville: "Douala",
    temperature: "",
    vent: "",
    pluie: "",
    humidite: "",
    radiation: ""
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoadCurrent = async () => {
    setLoadingCurrent(true);
    setError("");
    try {
      const data = await getCurrentWeather(formData.ville);
      setFormData({
        ville: data.ville,
        temperature: data.temperature.toString(),
        vent: data.vent.toString(),
        pluie: data.pluie.toString(),
        humidite: data.humidite.toString(),
        radiation: data.radiation.toString()
      });
    } catch (err) {
      setError("Impossible de charger les donnees actuelles pour cette ville.");
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = {
        ville: formData.ville,
        temperature: parseFloat(formData.temperature) || 25,
        vent: parseFloat(formData.vent) || 0,
        pluie: parseFloat(formData.pluie) || 0,
        humidite: parseFloat(formData.humidite) || 0,
        radiation: parseFloat(formData.radiation) || 0
      };
      
      const prediction = await predictPollution(data);
      setResult(prediction);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur s'est produite lors de la prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-blue-500" />
          Simulateur de Prediction PM2.5
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Entrez les conditions meteorologiques pour predire le niveau de pollution attendu.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="glass-card p-4 md:p-6 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-2 text-left">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ville</label>
                <select 
                  name="ville" 
                  value={formData.ville} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Douala">Douala</option>
                  <option value="Yaounde">Yaounde</option>
                  <option value="Garoua">Garoua</option>
                  <option value="Bamenda">Bamenda</option>
                  <option value="Maroua">Maroua</option>
                  <option value="Bafoussam">Bafoussam</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleLoadCurrent}
                disabled={loadingCurrent}
                title="Charger les conditions actuelles"
                className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-blue-500 ${loadingCurrent ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                <Thermometer className="w-4 h-4 text-orange-500" /> Temperature (C)
              </label>
              <input 
                type="number" step="0.1" name="temperature" required
                value={formData.temperature} onChange={handleChange}
                placeholder="Ex: 28.5"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <Wind className="w-4 h-4 text-teal-500" /> Vent (km/h)
                </label>
                <input 
                  type="number" step="0.1" name="vent" required
                  value={formData.vent} onChange={handleChange}
                  placeholder="Ex: 15"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <CloudRain className="w-4 h-4 text-blue-500" /> Pluie (mm)
                </label>
                <input 
                  type="number" step="0.1" name="pluie" required
                  value={formData.pluie} onChange={handleChange}
                  placeholder="Ex: 0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <Activity className="w-4 h-4 text-purple-500" /> Humidite
                </label>
                <input 
                  type="number" step="0.1" name="humidite"
                  value={formData.humidite} onChange={handleChange}
                  placeholder="Optionnel"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <Sun className="w-4 h-4 text-yellow-500" /> Radiation
                </label>
                <input 
                  type="number" step="0.1" name="radiation"
                  value={formData.radiation} onChange={handleChange}
                  placeholder="Optionnel"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 active:scale-95"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Lancer la Prediction IA"}
            </button>
          </form>
        </div>

        <div className="flex justify-center items-start">
          {error && (
            <div className="w-full p-4 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
              {error}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="text-center text-slate-400 dark:text-slate-500 py-12 px-6 glass-card w-full border-dashed">
              En attente des parametres meteorologiques...
            </div>
          )}

          {result && (
            <div className="w-full space-y-6 animate-fade-in">
              <HealthAlertCard 
                aqi={result.aqi} 
                pm25={result.pm25_prediction} 
                ville={result.input_ville} 
                niveau={result.niveau_risque} 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interpretability Section */}
                <div className="glass-card p-5 space-y-4 border-t-4 border-t-blue-500">
                  <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-500" /> Pourquoi ce résultat ?
                  </h4>
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 font-medium italic">Facteurs dominants identifiés :</p>
                    <div className="flex flex-col gap-2">
                      {result.explications.map((facteur: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-[10px]">{i+1}</span>
                          {facteur}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trend Section */}
                <div className="glass-card p-5 space-y-4 border-t-4 border-t-teal-500">
                  <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-500" /> Tendance à 24h
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className={`text-xl font-black uppercase ${result.tendance_24h.tendance === 'en hausse' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {result.tendance_24h.tendance}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Évolution prédite</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black">
                        {result.tendance_24h.pm25_demain} 
                        <span className="text-[10px] font-normal text-slate-500 ml-1">µg/m³</span>
                      </div>
                      <div className={`text-[10px] font-bold ${result.tendance_24h.delta > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {result.tendance_24h.delta > 0 ? '+' : ''}{result.tendance_24h.delta} delta
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${result.tendance_24h.delta > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
