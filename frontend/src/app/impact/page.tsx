"use client";

import { Leaf, Shield, Heart, Zap, Globe, AlertCircle } from "lucide-react";

export default function ImpactPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-fade-in">
      {/* Header Section */}
      <section className="text-center space-y-4 pt-8">
      <section className="text-center space-y-4 pt-4 md:pt-8">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-500 leading-tight">
          Strategie d&apos;Impact SmartAir
        </h1>
        <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
          Comment l&apos;intelligence artificielle aide le Cameroun a faire face aux defis climatiques et sanitaires.
        </p>
      </section>
      </section>

      {/* Context Section */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start px-4 md:px-0">
        <div className="glass-card p-6 md:p-8 space-y-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl md:text-2xl font-bold">Le Defi Camerounais</h2>
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Le Cameroun fait face a une developpement industriel croissant et a des phenomenes climatiques saisonniers comme l&apos;<b>Harmattan</b>. Ces vents secs et poussiereux degradent severement la qualite de l&apos;air.
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 md:p-4 rounded-xl border border-orange-100 dark:border-orange-800/30 flex gap-3">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-orange-600 flex-shrink-0" />
            <p className="text-xs md:text-sm text-orange-800 dark:text-orange-200">
              Chaque annee, les infections respiratoires augmentent de <b>30%</b> pendant la saison seche au Cameroun.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl md:text-2xl font-bold">Notre Solution IA</h2>
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            SmartAir utilise un moteur de prediction base sur <b>XGBoost</b> entraine sur 5 ans de donnees. En reliant la meteo aux indices de pollution, nous offrons une precision de plus de <b>90%</b>.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs md:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Surveillance de 40+ villes majeures
            </li>
            <li className="flex items-center gap-2 text-xs md:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Alertes automatiques (seuils OMS)
            </li>
          </ul>
        </div>
      </div>

      {/* Pillars of Impact */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Les 3 Piliers de Resilience</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold">Environnement</h3>
            <p className="text-sm text-slate-500">
              Identification des zones critiques et des sources de pollution stagnante pour guider les politiques de reforestation urbaine.
            </p>
          </div>

          <div className="glass-card p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold">Sante Publique</h3>
            <p className="text-sm text-slate-500">
              Reduction de l&apos;exposition des populations vulnerables (enfants, asthmatiques) grace a l&apos;alerte precoce.
            </p>
          </div>

          <div className="glass-card p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold">Economique</h3>
            <p className="text-sm text-slate-500">
              Optimisation de la productivite agricole en surveillant l&apos;ET0 (evapotranspiration) et les radiations solaires.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action / Quote */}
      <section className="glass-card p-6 md:p-10 bg-gradient-to-r from-blue-600 to-teal-500 text-white border-none text-center space-y-4 md:space-y-6 mx-4 md:mx-0">
        <blockquote className="text-lg md:text-2xl italic font-medium">
          &quot;L&apos;IA n&apos;est pas seulement une technologie, c&apos;est notre bouclier contre les incertitudes climatiques du futur.&quot;
        </blockquote>
        <div className="h-1 w-16 md:w-20 bg-white/30 mx-auto rounded-full"></div>
        <p className="text-white/80 text-xs md:text-base max-w-xl mx-auto">
          SmartAir Cameroon s&apos;engage a democratiser l&apos;acces aux donnees de qualite de l&apos;air pour chaque citoyen, du Grand-Nord jusqu&apos;au Littoral.
        </p>
      </section>
    </div>
  );
}
