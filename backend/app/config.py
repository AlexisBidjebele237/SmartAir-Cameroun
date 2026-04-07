"""
Configuration de l'application SMARTAIR CAMEROON.
Contient les chemins, parametres et constantes du projet.
"""

import os
from pathlib import Path

# --- Chemins du projet ---
RACINE_PROJET = Path(__file__).resolve().parent.parent.parent
CHEMIN_DONNEES = RACINE_PROJET / "data" / "Dataset_complet_Meteo.xlsx"
CHEMIN_CSV_CACHE = RACINE_PROJET / "data" / "dataset_nettoye.csv"
DOSSIER_MODELES = RACINE_PROJET / "models"

# Creer le dossier models s'il n'existe pas
DOSSIER_MODELES.mkdir(exist_ok=True)

CHEMIN_MODELE = DOSSIER_MODELES / "model.pkl"
CHEMIN_SCALER = DOSSIER_MODELES / "scaler.pkl"
CHEMIN_FEATURES = DOSSIER_MODELES / "features.json"
CHEMIN_METADATA = DOSSIER_MODELES / "metadata.json"

# --- Parametres de l'API ---
API_TITRE = "SMARTAIR CAMEROON API"
API_DESCRIPTION = "API de prediction de la qualite de l'air au Cameroun"
API_VERSION = "1.0.0"
API_PREFIX = "/api"

# --- Parametres du modele ML ---
TEST_SIZE = 0.2
RANDOM_STATE = 42

# --- Seuils de risque pollution (PM2.5 proxy) ---
SEUILS_RISQUE = {
    "faible": (0, 8),
    "modere": (8, 14),
    "dangereux": (14, 20),
    "critique": (20, float("inf")),
}

# --- Couleurs par niveau de risque ---
COULEURS_RISQUE = {
    "faible": "#10b981",
    "modere": "#f59e0b",
    "dangereux": "#f97316",
    "critique": "#ef4444",
}

# --- Recommandations sante par niveau ---
RECOMMANDATIONS = {
    "faible": "La qualite de l'air est bonne. Aucune precaution particuliere necessaire.",
    "modere": "Qualite de l'air acceptable. Les personnes sensibles devraient limiter les activites prolongees en exterieur.",
    "dangereux": "Qualite de l'air degradee. Limitez les activites en exterieur. Portez un masque si possible.",
    "critique": "Qualite de l'air dangereuse. Restez a l'interieur. Fermez les fenetres. Consultez un medecin en cas de symptomes respiratoires.",
}

# --- Coordonnees GPS corrigees pour les villes avec des valeurs manquantes ---
CORRECTIONS_GPS = {
    "Douala": {"latitude": 4.0511, "longitude": 9.7679},
    "Dschang": {"latitude": 5.4400, "longitude": 10.0530},
    "Edea": {"latitude": 3.8000, "longitude": 10.1300},
    "Foumban": {"latitude": 5.7200, "longitude": 10.8980},
    "Garoua": {"latitude": 9.3000, "longitude": 13.3920},
    "Kousseri": {"latitude": 12.0770, "longitude": 15.0300},
    "Kumbo": {"latitude": 6.2200, "longitude": 10.6600},
    "Limbe": {"latitude": 4.0200, "longitude": 9.2100},
    "Mbalmayo": {"latitude": 3.5100, "longitude": 11.5020},
    "Mbengwi": {"latitude": 5.9900, "longitude": 10.0000},
    "Mokolo": {"latitude": 10.7400, "longitude": 13.8000},
    "Wum": {"latitude": 6.3800, "longitude": 10.0700},
    "Yaounde": {"latitude": 3.8500, "longitude": 11.5021},
    "Yokadouma": {"latitude": 3.5100, "longitude": 15.0500},
}

# --- Colonnes a convertir en numerique ---
COLONNES_A_CONVERTIR = [
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "apparent_temperature_mean",
    "sunshine_duration",
    "precipitation_sum",
    "rain_sum",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "shortwave_radiation_sum",
    "et0_fao_evapotranspiration",
    "latitude",
    "longitude",
]

# --- Colonne a supprimer ---
COLONNES_A_SUPPRIMER = ["snowfall_sum"]
