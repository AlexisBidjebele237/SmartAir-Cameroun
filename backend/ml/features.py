"""
Module d'ingenierie des caracteristiques (Feature Engineering).
Transforme les donnees meteorologiques brutes en features exploitables
pour l'entrainement du modele de prediction de la qualite de l'air.
"""

import pandas as pd
import numpy as np


def creer_features_temporelles(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cree les features basees sur le temps.
    """
    df = df.copy()
    df["time"] = pd.to_datetime(df["time"])

    df["month"] = df["time"].dt.month
    df["day_of_year"] = df["time"].dt.dayofyear

    # Saison seche (Novembre a Mars) vs saison humide (Avril a Octobre)
    df["is_dry_season"] = df["month"].isin([11, 12, 1, 2, 3]).astype(int)

    return df


def creer_features_lag(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cree des features de retard temporel (lag features) et rolling.
    Permet au modele de capturer les tendances recentes.
    """
    df = df.copy()
    df = df.sort_values(["city", "time"]).reset_index(drop=True)

    if "temperature_2m_mean" in df.columns:
        df["temp_lag1"] = df.groupby("city")["temperature_2m_mean"].shift(1)
        df["temp_lag7"] = df.groupby("city")["temperature_2m_mean"].shift(7)
        # temp_roll7
        df["temp_roll7"] = df.groupby("city")["temperature_2m_mean"].transform(
            lambda x: x.rolling(window=7, min_periods=1).mean()
        )
    
    if "wind_speed_10m_max" in df.columns:
        df["wind_lag1"] = df.groupby("city")["wind_speed_10m_max"].shift(1)

    return df


def creer_proxy_pm25(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cree la variable cible : un proxy de la concentration PM2.5.
    (Reproduction stricte du Starter Notebook FR)
    """
    df = df.copy()

    # Formule exacte du proxy PM2.5
    pm25 = pd.Series(0, index=df.index)
    
    if "temperature_2m_mean" in df.columns:
        pm25 += 0.35 * df["temperature_2m_mean"].fillna(df["temperature_2m_mean"].mean())
    if "shortwave_radiation_sum" in df.columns:
        pm25 += 0.25 * df["shortwave_radiation_sum"].fillna(0)
    if "et0_fao_evapotranspiration" in df.columns:
        pm25 += 0.20 * df["et0_fao_evapotranspiration"].fillna(0)
    if "wind_speed_10m_max" in df.columns:
        pm25 -= 0.5 * df["wind_speed_10m_max"].fillna(0)
    if "precipitation_sum" in df.columns:
        pm25 -= 1.5 * df["precipitation_sum"].fillna(0)
    if "is_dry_season" in df.columns:
        pm25 += 4.0 * df["is_dry_season"]

    df["pm25_proxy"] = pm25.clip(lower=0)

    return df


def encoder_variables_categorielles(df: pd.DataFrame) -> pd.DataFrame:
    """
    Encode les variables categorielles (ville, region) en numerique.
    Utilise le LabelEncoder pour garder une representation compacte.
    """
    from sklearn.preprocessing import LabelEncoder

    df = df.copy()

    if "city" in df.columns:
        le_ville = LabelEncoder()
        df["city_enc"] = le_ville.fit_transform(df["city"].astype(str))

    if "region" in df.columns:
        le_region = LabelEncoder()
        df["region_enc"] = le_region.fit_transform(df["region"].astype(str))

    return df


def pipeline_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Execute le pipeline complet d'ingenierie des caracteristiques.
    """
    print("  [1/4] Creation des features temporelles...")
    df = creer_features_temporelles(df)

    print("  [2/4] Creation du proxy PM2.5...")
    df = creer_proxy_pm25(df)

    print("  [3/4] Creation des features de lag...")
    df = creer_features_lag(df)

    print("  [4/4] Encodage des variables categorielles...")
    df = encoder_variables_categorielles(df)

    # Remplir les NaN des features de lag (normaux en debut de serie par ville)
    colonnes_features = obtenir_colonnes_features()
    for col in colonnes_features:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].bfill().fillna(0)

    # Supprimer d'eventuels NaN restants sur l'ensemble du dataset (pour y)
    df = df.dropna(subset=["pm25_proxy"])
    
    print(f"  Dataset final : {len(df)} lignes, {len(df.columns)} colonnes")

    return df


def obtenir_colonnes_features() -> list:
    """
    Retourne la liste stricte des 16 colonnes a utiliser comme features
    pour l'entrainement du modele (Starter Notebook FR).
    """
    return [
        "temperature_2m_mean", 
        "precipitation_sum", 
        "wind_speed_10m_max",
        "shortwave_radiation_sum", 
        "et0_fao_evapotranspiration",
        "month", 
        "day_of_year", 
        "is_dry_season",
        "temp_lag1", 
        "temp_lag7", 
        "wind_lag1", 
        "temp_roll7",
        "latitude", 
        "longitude", 
        "region_enc", 
        "city_enc"
    ]
