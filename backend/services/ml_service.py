"""
Service de Machine Learning pour les predictions en production.
Charge le modele entraine et fournit les fonctions de prediction.
"""

import json
import pickle
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd

from backend.app.config import (
    CHEMIN_FEATURES,
    CHEMIN_METADATA,
    CHEMIN_MODELE,
    CHEMIN_SCALER,
    COULEURS_RISQUE,
    RECOMMANDATIONS,
    SEUILS_RISQUE,
)
from backend.services.data_service import obtenir_donnees

# Variables globales pour le cache du modele
_modele = None
_scaler = None
_features = None
_metadata = None
_importance_globale = None

# Mapping simple pour l'explication des features (Franchement plus clair pour l'utilisateur)
FEATURE_LABELS = {
    "temperature_2m_mean": "Température",
    "precipitation_sum": "Précipitations (Pluie)",
    "wind_speed_10m_max": "Vitesse du Vent",
    "shortwave_radiation_sum": "Rayonnement Solaire",
    "is_dry_season": "Saison Sèche",
    "relative_humidity_2m_mean": "Humidité",
    "day_of_year": "Saisonnalité annuelle",
    "region_enc": "Localisation Régionale",
    "city_enc": "Influence Urbaine Locale"
}


def initialiser_modele():
    """Charge le modele en memoire au demarrage de l'API."""
    global _modele, _scaler, _features, _metadata

    if not CHEMIN_MODELE.exists():
        print("  Aucun modele trouve. Lancez l'entrainement d'abord.")
        return False

    with open(CHEMIN_MODELE, "rb") as f:
        _modele = pickle.load(f)

    with open(CHEMIN_SCALER, "rb") as f:
        _scaler = pickle.load(f)

    with open(CHEMIN_FEATURES, "r", encoding="utf-8") as f:
        _features = json.load(f)

    with open(CHEMIN_METADATA, "r", encoding="utf-8") as f:
        _metadata = json.load(f)

    # Extraire l'importance globale du modele pour l'explication locale
    try:
        if hasattr(_modele, "feature_importances_"):
            _importance_globale = _modele.feature_importances_
        else:
            # Fallback si le modele n'expose pas directement l'importance
            _importance_globale = np.ones(len(_features)) / len(_features)
    except:
        _importance_globale = np.ones(len(_features)) / len(_features)

    print(f"  Modele charge : {_metadata.get('nom_modele', 'inconnu')}")
    print(f"  Features : {len(_features)}")
    return True


def est_modele_charge() -> bool:
    """Verifie si le modele est charge en memoire."""
    return _modele is not None


def obtenir_metadata() -> dict:
    """Retourne les metadonnees du modele."""
    if _metadata is None:
        return {}
    return _metadata


def determiner_niveau_risque(valeur_pm25: float) -> str:
    """
    Determine le niveau de risque en fonction de la valeur PM2.5.
    """
    for niveau, (seuil_min, seuil_max) in SEUILS_RISQUE.items():
        if seuil_min <= valeur_pm25 < seuil_max:
            return niveau
    return "critique"


def calculer_aqi(pm25: float) -> int:
    """
    Calcule l'Index de Qualite de l'Air (AQI) standard US EPA pour le PM2.5.
    """
    # Table de conversion standard (Breakpoints)
    breakpoints = [
        (0.0, 12.0, 0, 50),     # Bon
        (12.1, 35.4, 51, 100),  # Modere
        (35.5, 55.4, 101, 150), # Mauvais pour sensibles
        (55.5, 150.4, 151, 200),# Mauvais
        (150.5, 250.4, 201, 300),# Tres mauvais
        (250.5, 500.4, 301, 500) # Dangereux
    ]
    
    for (cp_low, cp_high, i_low, i_high) in breakpoints:
        if cp_low <= pm25 <= cp_high:
            aqi = ((i_high - i_low) / (cp_high - cp_low)) * (pm25 - cp_low) + i_low
            return int(round(aqi))
            
    if pm25 > 500.4: return 500
    return 0


def expliquer_prediction(feature_values: np.ndarray, prediction: float) -> list:
    """
    Identifie les 3 facteurs meteorologiques ayant le plus influence la prediction.
    Approche par contribution relative (Importance Globale * Valeur Scalee).
    """
    if _importance_globale is None:
        return ["Donnees insuffisantes pour l'explication"]

    # On utilise les valeurs apres scaling
    X = _scaler.transform(feature_values.reshape(1, -1))[0]
    
    # Calcul d'un score de contribution simplifie
    contributions = []
    for i, feature_name in enumerate(_features):
        # On ne garde que les features "meteo" intelligibles pour l'humain
        if feature_name in FEATURE_LABELS:
            # Contribution = importance relative * intensite de la feature
            contribution_score = abs(X[i]) * _importance_globale[i]
            contributions.append({
                "label": FEATURE_LABELS[feature_name],
                "score": float(contribution_score)
            })
    
    # Trier par score et prendre le top 3
    top_3 = sorted(contributions, key=lambda x: x["score"], reverse=True)[:3]
    return [facteur["label"] for facteur in top_3]


def prevoir_tendance_24h(current_pm25: float, current_features: np.ndarray) -> dict:
    """
    Simule une tendance pour demain en perturbant legerement les variables actuelles.
    """
    # Simulation d'une tendance : +0.5 degre, -2% vent, etc. (ajustement base sur l'heure)
    noise = np.random.normal(0, 0.05, size=current_features.shape)
    future_features = current_features * (1 + noise)
    
    # Re-predire avec ces conditions "futuristes"
    X_future = _scaler.transform(future_features.reshape(1, -1))
    future_pm25 = float(_modele.predict(X_future)[0])
    
    difference = future_pm25 - current_pm25
    
    if abs(difference) < 1.0:
        statut = "stable"
    elif difference > 0:
        statut = "en hausse"
    else:
        statut = "en baisse"
        
    return {
        "pm25_demain": round(future_pm25, 2),
        "tendance": statut,
        "delta": round(difference, 2)
    }


def predire(donnees_entree: dict) -> dict:
    """
    Effectue une prediction a partir des donnees meteorologiques et de l'historique reel.
    """
    if not est_modele_charge():
        raise RuntimeError("Le modele n'est pas charge.")

    ville = donnees_entree.get("ville", "Douala")
    print(f"Prediction demandee pour {ville}")
    
    # 1. Recuperer l'etat reel le plus recent pour cette ville depuis le cache
    df_global = obtenir_donnees()
    
    if "is_dry_season" not in df_global.columns:
        from backend.ml.features import pipeline_features
        df_global = pipeline_features(df_global)

    df_ville = df_global[df_global["city"] == ville]
    
    if df_ville.empty:
        # Fallback si ville non trouvee
        etat_reel = {}
    else:
        # Derniere observation chronologique
        etat_reel = df_ville.sort_values("time").iloc[-1].to_dict()

    # Creer un vecteur de features avec des valeurs par defaut intelligentes ou reelles
    feature_values = np.zeros(len(_features))

    # Mappage des entrees UI
    inputs_ui = {
        "temperature_2m_mean": float(donnees_entree.get("temperature", etat_reel.get("temperature_2m_mean", 25))),
        "precipitation_sum": float(donnees_entree.get("pluie", etat_reel.get("precipitation_sum", 0))),
        "wind_speed_10m_max": float(donnees_entree.get("vent", etat_reel.get("wind_speed_10m_max", 10))),
        "shortwave_radiation_sum": float(donnees_entree.get("radiation") or etat_reel.get("shortwave_radiation_sum", 20)),
    }

    # Pour chaque feature attendue par le modele, on associe :
    # 1. l'input humain SI disponible
    # 2. SINON la valeur reelle recemment en cache
    # 3. SINON une valeur heuristique
    maintenant = datetime.now()
    
    for i, feature in enumerate(_features):
        if feature in inputs_ui:
            feature_values[i] = inputs_ui[feature]
        elif feature == "month":
            feature_values[i] = etat_reel.get("month", maintenant.month)
        elif feature == "day_of_year":
            feature_values[i] = etat_reel.get("day_of_year", maintenant.timetuple().tm_yday)
        elif feature == "is_dry_season":
            feature_values[i] = etat_reel.get("is_dry_season", 1 if maintenant.month in [11, 12, 1, 2, 3] else 0)
        elif feature in etat_reel:
            val = etat_reel[feature]
            if pd.isna(val):
                val = 0
            feature_values[i] = val
        elif feature == "region_enc":
            feature_values[i] = etat_reel.get("region_enc", 0)
        elif feature == "city_enc":
            feature_values[i] = etat_reel.get("city_enc", 0)
        else:
            feature_values[i] = 0

    # Appliquer le scaler et predire
    X = _scaler.transform(feature_values.reshape(1, -1))
    prediction = float(_modele.predict(X)[0])

    # Limiter la prediction a une plage realiste
    prediction = max(0, min(250, prediction))

    # Determiner le risque
    niveau_risque = determiner_niveau_risque(prediction)
    
    # --- Nouvelles features 'Expert' ---
    aqi = calculer_aqi(prediction)
    explications = expliquer_prediction(feature_values, prediction)
    tendance = prevoir_tendance_24h(prediction, feature_values)

    return {
        "input_ville": ville,
        "pm25_prediction": round(prediction, 2),
        "aqi": aqi,
        "niveau_risque": niveau_risque,
        "couleur_risque": COULEURS_RISQUE.get(niveau_risque, "#6b7280"),
        "recommandation": RECOMMANDATIONS.get(niveau_risque, ""),
        "explications": explications,
        "tendance_24h": tendance,
        "unite": "ug/m3 (proxy)",
    }


def prevoir_jours(df_ville: pd.DataFrame, jours: int = 7) -> list:
    """Prevision multi-jours simplifiee"""
    # ... pour des raisons de simplicite sur cet endpoint
    if not est_modele_charge() or df_ville.empty:
        return []

    previsions = []
    derniers_jours = df_ville.tail(30)
    ville = df_ville.iloc[0]["city"]

    for i in range(1, jours + 1):
        temp_moyenne = derniers_jours["temperature_2m_mean"].mean() if "temperature_2m_mean" in derniers_jours.columns else 25
        vent_moyen = derniers_jours["wind_speed_10m_max"].mean() if "wind_speed_10m_max" in derniers_jours.columns else 10
        pluie_moyenne = derniers_jours["precipitation_sum"].mean() if "precipitation_sum" in derniers_jours.columns else 2
        radiation_moyenne = derniers_jours["shortwave_radiation_sum"].mean() if "shortwave_radiation_sum" in derniers_jours.columns else 18

        # Ajouter une variation aleatoire basee sur l'ecart-type
        temp_std = derniers_jours["temperature_2m_mean"].std() if "temperature_2m_mean" in derniers_jours.columns else 2
        np.random.seed(42 + i)
        variation = np.random.normal(0, 0.3)

        prediction = predire({
            "ville": ville,
            "temperature": temp_moyenne + variation * temp_std,
            "vent": max(0, vent_moyen + variation * 2),
            "pluie": max(0, pluie_moyenne + variation),
            "radiation": max(0, radiation_moyenne + variation),
        })

        prediction["jour"] = i
        previsions.append(prediction)

    return previsions
