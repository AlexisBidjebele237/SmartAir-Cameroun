"""
Service d'alertes intelligentes pour SMARTAIR CAMEROON.
Genere des alertes basees sur les predictions de pollution
et fournit des recommandations de sante.
"""

import pandas as pd
import numpy as np

from backend.app.config import (
    SEUILS_RISQUE,
    COULEURS_RISQUE,
    RECOMMANDATIONS,
)
from backend.ml.features import creer_proxy_pm25, creer_features_temporelles


def generer_alertes(df: pd.DataFrame) -> list:
    """
    Analyse les donnees recentes de toutes les villes et genere des alertes
    pour celles dont le niveau de pollution depasse les seuils.
    """
    alertes = []

    if "pm25_proxy" not in df.columns:
        # Calculer le vrai proxy
        df = _calculer_vrai_proxy(df)

    # Prendre les dernieres donnees de chaque ville
    dernieres_donnees = df.sort_values("time").groupby("city").tail(1)

    for _, ligne in dernieres_donnees.iterrows():
        pm25 = ligne.get("pm25_proxy", 0)
        niveau = _determiner_niveau(pm25)

        if niveau in ("modere", "dangereux", "critique"):
            alerte = {
                "ville": ligne["city"],
                "region": ligne.get("region", ""),
                "pm25": round(float(pm25), 2),
                "niveau": niveau,
                "couleur": COULEURS_RISQUE.get(niveau, "#6b7280"),
                "recommandation": RECOMMANDATIONS.get(niveau, ""),
                "date": str(ligne.get("time", "")),
                "temperature": round(float(ligne.get("temperature_2m_mean", 0)), 1),
                "vent": round(float(ligne.get("wind_speed_10m_max", 0)), 1),
                "pluie": round(float(ligne.get("precipitation_sum", 0)), 1),
                "latitude": float(ligne.get("latitude", 0)),
                "longitude": float(ligne.get("longitude", 0)),
            }
            alertes.append(alerte)

    # Trier par severite (critique en premier)
    ordre_severite = {"critique": 0, "dangereux": 1, "modere": 2, "faible": 3}
    alertes.sort(key=lambda a: (ordre_severite.get(a["niveau"], 4), -a["pm25"]))

    return alertes


def obtenir_resume_alertes(df: pd.DataFrame) -> dict:
    """
    Genere un resume des alertes pour le tableau de bord.
    """
    alertes = generer_alertes(df)

    resume = {
        "total": len(alertes),
        "critique": sum(1 for a in alertes if a["niveau"] == "critique"),
        "dangereux": sum(1 for a in alertes if a["niveau"] == "dangereux"),
        "modere": sum(1 for a in alertes if a["niveau"] == "modere"),
        "alertes": alertes,
    }

    return resume


def _determiner_niveau(valeur_pm25: float) -> str:
    """Determine le niveau de risque a partir de la valeur PM2.5."""
    for niveau, (seuil_min, seuil_max) in SEUILS_RISQUE.items():
        if seuil_min <= valeur_pm25 < seuil_max:
            return niveau
    return "critique"


def _calculer_vrai_proxy(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcule le proxy PM2.5 reel defini par le ML notebook
    """
    df = df.copy()
    if "is_dry_season" not in df.columns:
        df = creer_features_temporelles(df)
    
    df = creer_proxy_pm25(df)
    return df
