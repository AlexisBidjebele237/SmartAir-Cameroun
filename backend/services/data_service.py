"""
Service de donnees pour SMARTAIR CAMEROON.
Fournit les donnees meteorologiques formatees pour l'API.
"""

import pandas as pd
import numpy as np

from backend.app.database import charger_donnees, obtenir_liste_villes, obtenir_donnees_ville

# Cache global des donnees
_df_cache = None


def obtenir_donnees() -> pd.DataFrame:
    """Retourne le DataFrame en cache ou le charge."""
    global _df_cache
    if _df_cache is None:
        _df_cache = charger_donnees()
    return _df_cache


def recharger_donnees():
    """Force le rechargement des donnees."""
    global _df_cache
    _df_cache = charger_donnees(forcer_reload=True)
    return _df_cache


def obtenir_villes() -> list:
    """Retourne la liste des villes avec leurs infos."""
    df = obtenir_donnees()
    return obtenir_liste_villes(df)


def obtenir_historique(ville: str, date_debut: str = None, date_fin: str = None) -> list:
    """
    Retourne l'historique meteo d'une ville sous forme de liste de dicts.
    """
    df = obtenir_donnees()
    df_ville = obtenir_donnees_ville(df, ville, date_debut, date_fin)

    if df_ville.empty:
        return []

    colonnes = [
        "time", "temperature_2m_mean", "temperature_2m_max", "temperature_2m_min",
        "precipitation_sum", "wind_speed_10m_max", "wind_gusts_10m_max",
        "shortwave_radiation_sum", "sunshine_duration", "precipitation_hours",
    ]
    colonnes_disponibles = [c for c in colonnes if c in df_ville.columns]

    resultat = df_ville[colonnes_disponibles].copy()
    resultat["time"] = resultat["time"].astype(str)

    return resultat.to_dict(orient="records")


def obtenir_statistiques_globales() -> dict:
    """
    Retourne les statistiques globales du dataset pour le dashboard.
    """
    df = obtenir_donnees()

    stats = {
        "nombre_villes": int(df["city"].nunique()),
        "nombre_regions": int(df["region"].nunique()),
        "nombre_observations": len(df),
        "date_debut": str(df["time"].min()),
        "date_fin": str(df["time"].max()),
    }

    for col in ["temperature_2m_mean", "precipitation_sum", "wind_speed_10m_max"]:
        if col in df.columns:
            val = pd.to_numeric(df[col], errors="coerce").mean()
            stats[f"moyenne_{col}"] = round(float(val), 2) if not np.isnan(val) else 0

    return stats


def obtenir_donnees_carte() -> list:
    """
    Retourne les donnees formatees pour la carte interactive.
    Derniere observation par ville avec proxy de pollution.
    """
    df = obtenir_donnees()
    
    from backend.services.alert_service import _calculer_vrai_proxy, _determiner_niveau
    from backend.app.config import COULEURS_RISQUE

    df_proxy = _calculer_vrai_proxy(df)
    
    dernieres = df_proxy.sort_values("time").groupby("city").tail(1)

    resultats = []
    for _, ligne in dernieres.iterrows():
        pm25 = float(ligne.get("pm25_proxy", 0))
        niveau = _determiner_niveau(pm25)

        resultats.append({
            "ville": ligne["city"],
            "region": ligne.get("region", ""),
            "latitude": float(ligne.get("latitude", 0)),
            "longitude": float(ligne.get("longitude", 0)),
            "pm25": round(pm25, 2),
            "niveau": niveau,
            "couleur": COULEURS_RISQUE.get(niveau, "#6b7280"),
            "temperature": round(float(pd.to_numeric(ligne.get("temperature_2m_mean", 0), errors="coerce") or 0), 1),
            "vent": round(float(pd.to_numeric(ligne.get("wind_speed_10m_max", 0), errors="coerce") or 0), 1),
            "pluie": round(float(pd.to_numeric(ligne.get("precipitation_sum", 0), errors="coerce") or 0), 1),
        })

    return resultats


def obtenir_correlations() -> dict:
    """
    Retourne les donnees de correlation entre facteurs climatiques et PM2.5 proxy.
    Utilise pour le graphique de comparaison climat vs qualite de l'air.
    """
    df = obtenir_donnees()
    
    from backend.services.alert_service import _calculer_vrai_proxy

    df_proxy = _calculer_vrai_proxy(df)

    # Convertir les colonnes en numeriques
    cols_meteo = ["temperature_2m_mean", "wind_speed_10m_max", "precipitation_sum", "shortwave_radiation_sum"]
    for c in cols_meteo:
        if c in df_proxy.columns:
            df_proxy[c] = pd.to_numeric(df_proxy[c], errors="coerce")

    # 1. Scatter data : echantillon de points pour le scatter plot
    sample = df_proxy.dropna(subset=["pm25_proxy", "temperature_2m_mean"]).sample(
        n=min(500, len(df_proxy)), random_state=42
    )
    scatter_data = []
    for _, r in sample.iterrows():
        scatter_data.append({
            "temperature": round(float(r.get("temperature_2m_mean", 0)), 1),
            "vent": round(float(r.get("wind_speed_10m_max", 0)), 1),
            "pluie": round(float(r.get("precipitation_sum", 0)), 1),
            "pm25": round(float(r.get("pm25_proxy", 0)), 2),
            "ville": r.get("city", ""),
        })

    # 2. Moyennes mensuelles pour la serie temporelle
    df_proxy["time"] = pd.to_datetime(df_proxy["time"])
    df_proxy["mois_annee"] = df_proxy["time"].dt.to_period("M").astype(str)
    
    moyennes_mensuelles = df_proxy.groupby("mois_annee").agg({
        "temperature_2m_mean": "mean",
        "wind_speed_10m_max": "mean",
        "precipitation_sum": "mean",
        "pm25_proxy": "mean",
    }).reset_index()

    timeline_data = []
    for _, r in moyennes_mensuelles.iterrows():
        timeline_data.append({
            "mois": r["mois_annee"],
            "temperature": round(float(r["temperature_2m_mean"]), 1),
            "vent": round(float(r["wind_speed_10m_max"]), 1),
            "pluie": round(float(r["precipitation_sum"]), 1),
            "pm25": round(float(r["pm25_proxy"]), 2),
        })

    # 3. Matrice de correlation simplifiee
    cols_corr = ["temperature_2m_mean", "wind_speed_10m_max", "precipitation_sum", "shortwave_radiation_sum", "pm25_proxy"]
    cols_existantes = [c for c in cols_corr if c in df_proxy.columns]
    corr_matrix = df_proxy[cols_existantes].corr()

    labels_fr = {
        "temperature_2m_mean": "Temperature",
        "wind_speed_10m_max": "Vent",
        "precipitation_sum": "Pluie",
        "shortwave_radiation_sum": "Radiation",
        "pm25_proxy": "PM2.5 Proxy",
    }

    correlations = {}
    if "pm25_proxy" in corr_matrix:
        for col in cols_existantes:
            if col != "pm25_proxy":
                correlations[labels_fr.get(col, col)] = round(float(corr_matrix.loc[col, "pm25_proxy"]), 3)

    # 4. Moyennes par region
    moyennes_region = df_proxy.groupby("region").agg({
        "temperature_2m_mean": "mean",
        "pm25_proxy": "mean",
        "wind_speed_10m_max": "mean",
    }).reset_index()

    regions_data = []
    for _, r in moyennes_region.iterrows():
        regions_data.append({
            "region": r["region"],
            "temperature": round(float(r["temperature_2m_mean"]), 1),
            "pm25": round(float(r["pm25_proxy"]), 2),
            "vent": round(float(r["wind_speed_10m_max"]), 1),
        })

    return {
        "scatter": scatter_data,
        "timeline": timeline_data,
        "correlations": correlations,
        "regions": regions_data,
    }


def obtenir_derniere_meteo(ville: str) -> dict:
    """
    Retourne les parametres meteorologiques les plus recents pour une ville donnee.
    Utilise pour pre-remplir le simulateur de prediction avec 'les conditions actuelles'.
    """
    df = obtenir_donnees()
    df_ville = df[df["city"] == ville].sort_values("time")

    if df_ville.empty:
        return {}

    derniere = df_ville.iloc[-1]
    
    return {
        "ville": ville,
        "date": str(derniere.get("time", "")),
        "temperature": round(float(pd.to_numeric(derniere.get("temperature_2m_mean", 25), errors="coerce")), 1),
        "vent": round(float(pd.to_numeric(derniere.get("wind_speed_10m_max", 10), errors="coerce")), 1),
        "pluie": round(float(pd.to_numeric(derniere.get("precipitation_sum", 0), errors="coerce")), 1),
        "humidite": round(float(pd.to_numeric(derniere.get("daylight_duration", 12), errors="coerce") / 3600), 1), # Proxy simule pour l'UI
        "radiation": round(float(pd.to_numeric(derniere.get("shortwave_radiation_sum", 20), errors="coerce")), 1),
    }
