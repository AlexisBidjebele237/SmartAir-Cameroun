"""
Module de chargement et preparation initiale des donnees.
Gere le chargement du fichier Excel, la conversion en CSV,
et le nettoyage de base des types de donnees.
"""

import pandas as pd
import numpy as np
from pathlib import Path

from backend.app.config import (
    CHEMIN_DONNEES,
    CHEMIN_CSV_CACHE,
    COLONNES_A_CONVERTIR,
    COLONNES_A_SUPPRIMER,
    CORRECTIONS_GPS,
)


def charger_donnees(forcer_reload: bool = False) -> pd.DataFrame:
    """
    Charge le dataset depuis le fichier Excel ou le cache CSV.
    Applique le nettoyage de base des types et les corrections GPS.
    
    Args:
        forcer_reload: Si True, recharge depuis l'Excel meme si le CSV existe.
    
    Returns:
        DataFrame nettoye avec les bons types de donnees.
    """
    # Utiliser le cache CSV s'il existe (beaucoup plus rapide)
    if CHEMIN_CSV_CACHE.exists() and not forcer_reload:
        print(f"Chargement depuis le cache CSV : {CHEMIN_CSV_CACHE}")
        df = pd.read_csv(CHEMIN_CSV_CACHE, parse_dates=["time"])
        return df

    # Charger depuis l'Excel original
    print(f"Chargement depuis l'Excel : {CHEMIN_DONNEES}")
    df = pd.read_excel(CHEMIN_DONNEES)

    # Etape 1 : Convertir la colonne time en datetime
    df["time"] = pd.to_datetime(df["time"], errors="coerce")

    # Etape 2 : Convertir les colonnes numeriques corrompues (type object -> float)
    for col in COLONNES_A_CONVERTIR:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Etape 3 : Supprimer les colonnes inutiles
    for col in COLONNES_A_SUPPRIMER:
        if col in df.columns:
            df.drop(columns=[col], inplace=True)

    # Etape 4 : Corriger les coordonnees GPS manquantes (0.0)
    for ville, coords in CORRECTIONS_GPS.items():
        masque = df["city"] == ville
        if masque.any():
            df.loc[masque, "latitude"] = coords["latitude"]
            df.loc[masque, "longitude"] = coords["longitude"]

    # Etape 5 : Imputation des valeurs manquantes (creees par la conversion)
    df = imputer_valeurs_manquantes(df)

    # Etape 6 : Sauvegarder en CSV cache pour les prochains chargements
    print(f"Sauvegarde du cache CSV : {CHEMIN_CSV_CACHE}")
    df.to_csv(CHEMIN_CSV_CACHE, index=False)

    return df


def imputer_valeurs_manquantes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Impute les valeurs manquantes creees par la conversion de types.
    Strategie : interpolation lineaire par ville, puis mediane par ville/mois.
    
    Args:
        df: DataFrame avec potentiellement des NaN.
    
    Returns:
        DataFrame sans valeurs manquantes dans les colonnes numeriques.
    """
    colonnes_numeriques = df.select_dtypes(include=[np.number]).columns.tolist()
    colonnes_numeriques = [c for c in colonnes_numeriques if c != "id"]

    # Trier par ville et date pour l'interpolation
    df = df.sort_values(["city", "time"]).reset_index(drop=True)

    # Interpolation lineaire par ville
    for col in colonnes_numeriques:
        if df[col].isna().any():
            df[col] = df.groupby("city")[col].transform(
                lambda x: x.interpolate(method="linear", limit_direction="both")
            )

    # Fallback : mediane par ville pour les NaN restants
    for col in colonnes_numeriques:
        if df[col].isna().any():
            df[col] = df.groupby("city")[col].transform(
                lambda x: x.fillna(x.median())
            )

    # Dernier fallback : mediane globale
    for col in colonnes_numeriques:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())

    return df


def obtenir_liste_villes(df: pd.DataFrame) -> list:
    """Retourne la liste triee des villes avec leurs coordonnees et region."""
    villes = (
        df.groupby("city")
        .agg(
            region=("region", "first"),
            latitude=("latitude", "first"),
            longitude=("longitude", "first"),
        )
        .reset_index()
        .sort_values("city")
    )
    return villes.to_dict(orient="records")


def obtenir_donnees_ville(
    df: pd.DataFrame, ville: str, date_debut: str = None, date_fin: str = None
) -> pd.DataFrame:
    """
    Filtre les donnees pour une ville et une periode donnees.
    
    Args:
        df: DataFrame complet.
        ville: Nom de la ville.
        date_debut: Date de debut (format YYYY-MM-DD).
        date_fin: Date de fin (format YYYY-MM-DD).
    
    Returns:
        DataFrame filtre.
    """
    masque = df["city"] == ville

    if date_debut:
        masque &= df["time"] >= pd.to_datetime(date_debut)
    if date_fin:
        masque &= df["time"] <= pd.to_datetime(date_fin)

    return df[masque].copy()
