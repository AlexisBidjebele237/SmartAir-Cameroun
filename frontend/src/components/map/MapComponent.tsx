"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Correction icone par defaut react-leaflet (bien que non utilise avec CircleMarker)
import L from "leaflet";

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ mapData, selectedPoint }: { mapData: any[], selectedPoint?: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[400px] md:h-[600px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />;

  // Centre du Cameroun environ
  const cameroonCenter: [number, number] = [5.3, 12.3];

  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800 relative group">
      <div className="absolute top-4 right-4 z-[1000] glass-card p-2 md:p-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Live Monitoring
      </div>
      
      <MapContainer 
        center={cameroonCenter} 
        zoom={6} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        {selectedPoint && (
          <ChangeView center={[selectedPoint.latitude, selectedPoint.longitude]} zoom={10} />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Simple Markers">
            <div className="hidden" />
          </LayersControl.BaseLayer>
          
          <LayersControl.Overlay checked name="Heat / Influence Zones">
            <>
              {mapData.map((city, idx) => (
                <CircleMarker
                  key={`heat-${idx}`}
                  center={[city.latitude, city.longitude]}
                  radius={Math.max(25, (city.pm25 / 25) * 50)}
                  pathOptions={{
                    color: city.couleur,
                    fillColor: city.couleur,
                    fillOpacity: 0.12,
                    weight: 0,
                    className: "animate-pulse" // Effet Live
                  }}
                  interactive={false}
                />
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Precise Points">
            <>
              {mapData.map((city, idx) => (
                <CircleMarker
                  key={idx}
                  center={[city.latitude, city.longitude]}
                  radius={Math.max(12, (city.pm25 / 25) * 20)}
                  pathOptions={{
                    color: "white",
                    fillColor: city.couleur,
                    fillOpacity: 0.9,
                    weight: 2
                  }}
                >
                  <Popup className="custom-popup rounded-lg overflow-hidden shadow-xl border-none">
                    <div className="p-4 w-48 text-center space-y-3">
                      <div className="space-y-0.5">
                        <h3 className="font-black text-xl text-slate-800">{city.ville}</h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{city.region}</span>
                      </div>
                      
                      <div 
                        className="py-1 px-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest inline-block"
                        style={{ backgroundColor: city.couleur }}
                      >
                        {city.niveau}
                      </div>

                      <div className="text-3xl font-black flex items-center justify-center gap-1" style={{ color: city.couleur }}>
                        {city.pm25} 
                        <span className="text-xs font-normal text-slate-400 mt-2">ug/m³</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                        <div className="flex flex-col text-[10px] text-slate-500">
                          <span className="font-bold text-slate-800">{city.temperature}°C</span>
                          Température
                        </div>
                        <div className="flex flex-col text-[10px] text-slate-500">
                          <span className="font-bold text-slate-800">{city.vent} km/h</span>
                          Vitesse vent
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
