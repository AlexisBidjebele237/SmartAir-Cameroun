"""
Pipeline Machine Learning complet pour SMARTAIR CAMEROON.
Gere le preprocessing, l'entrainement, l'evaluation et la sauvegarde
des modeles de prediction de la qualite de l'air.
"""

import json
import pickle
import time
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

from backend.app.config import (
    CHEMIN_FEATURES,
    CHEMIN_METADATA,
    CHEMIN_MODELE,
    CHEMIN_SCALER,
    RANDOM_STATE,
    TEST_SIZE,
)
from backend.ml.features import obtenir_colonnes_features, pipeline_features


def preparer_donnees(df: pd.DataFrame):
    """
    Prepare les donnees pour l'entrainement.
    Applique le pipeline de features et separe X/y.
    
    Returns:
        X_train, X_test, y_train, y_test, scaler, feature_names
    """
    print("\n--- Preparation des donnees ---")

    # Appliquer le pipeline de features
    df = pipeline_features(df)

    # Definir les colonnes features et la cible
    toutes_features = obtenir_colonnes_features()
    features_disponibles = [c for c in toutes_features if c in df.columns]
    cible = "pm25_proxy"

    print(f"  Features disponibles : {len(features_disponibles)}/{len(toutes_features)}")
    print(f"  Variable cible : {cible}")

    # Verifier que la cible existe
    if cible not in df.columns:
        raise ValueError(f"La colonne cible '{cible}' n'existe pas dans le DataFrame.")

    X = df[features_disponibles].values
    y = df[cible].values

    # Split temporel (80/20) - pas de shuffle pour respecter l'ordre temporel
    split_idx = int(len(X) * (1 - TEST_SIZE))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    print(f"  Entrainement : {len(X_train)} echantillons")
    print(f"  Test : {len(X_test)} echantillons")

    # Normalisation
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    return X_train, X_test, y_train, y_test, scaler, features_disponibles, df


def entrainer_modeles(X_train, y_train, X_test, y_test):
    """
    Entraine et compare plusieurs modeles.
    
    Returns:
        meilleur_modele, resultats (dict)
    """
    print("\n--- Entrainement des modeles ---")

    modeles = {
        "Random Forest": RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        # "Gradient Boosting": GradientBoostingRegressor(
        #     n_estimators=200,
        #     max_depth=8,
        #     learning_rate=0.1,
        #     subsample=0.8,
        #     random_state=RANDOM_STATE,
        # ),
    }

    # Essayer d'importer XGBoost
    try:
        from xgboost import XGBRegressor

        modeles["XGBoost"] = XGBRegressor(
            n_estimators=300,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbosity=0,
        )
    except ImportError:
        print("  XGBoost non disponible, utilisation de RF et GBR uniquement.")

    resultats = {}
    meilleur_score = -float("inf")
    meilleur_modele = None
    meilleur_nom = None

    for nom, modele in modeles.items():
        print(f"\n  Entrainement de {nom}...")
        debut = time.time()

        modele.fit(X_train, y_train)
        y_pred = modele.predict(X_test)

        duree = time.time() - debut
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        resultats[nom] = {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "r2": round(r2, 4),
            "duree_secondes": round(duree, 2),
        }

        print(f"    RMSE : {rmse:.4f}")
        print(f"    MAE  : {mae:.4f}")
        print(f"    R2   : {r2:.4f}")
        print(f"    Duree: {duree:.2f}s")

        if r2 > meilleur_score:
            meilleur_score = r2
            meilleur_modele = modele
            meilleur_nom = nom

    print(f"\n  Meilleur modele : {meilleur_nom} (R2 = {meilleur_score:.4f})")

    return meilleur_modele, meilleur_nom, resultats


def sauvegarder_modele(modele, scaler, feature_names, resultats, meilleur_nom):
    """
    Sauvegarde le modele, le scaler et les metadonnees.
    """
    print("\n--- Sauvegarde du modele ---")

    # Sauvegarder le modele
    with open(CHEMIN_MODELE, "wb") as f:
        pickle.dump(modele, f)
    print(f"  Modele sauvegarde : {CHEMIN_MODELE}")

    # Sauvegarder le scaler
    with open(CHEMIN_SCALER, "wb") as f:
        pickle.dump(scaler, f)
    print(f"  Scaler sauvegarde : {CHEMIN_SCALER}")

    # Sauvegarder la liste des features
    with open(CHEMIN_FEATURES, "w", encoding="utf-8") as f:
        json.dump(feature_names, f, indent=2, ensure_ascii=False)
    print(f"  Features sauvegardees : {CHEMIN_FEATURES}")

    # Sauvegarder les metadonnees
    metadata = {
        "nom_modele": meilleur_nom,
        "date_entrainement": datetime.now().isoformat(),
        "nombre_features": len(feature_names),
        "resultats": resultats,
    }
    with open(CHEMIN_METADATA, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"  Metadonnees sauvegardees : {CHEMIN_METADATA}")


def charger_modele():
    """
    Charge le modele, le scaler et les features depuis les fichiers sauvegardes.
    
    Returns:
        modele, scaler, feature_names, metadata
    """
    with open(CHEMIN_MODELE, "rb") as f:
        modele = pickle.load(f)

    with open(CHEMIN_SCALER, "rb") as f:
        scaler = pickle.load(f)

    with open(CHEMIN_FEATURES, "r", encoding="utf-8") as f:
        feature_names = json.load(f)

    with open(CHEMIN_METADATA, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    return modele, scaler, feature_names, metadata


def executer_pipeline(df: pd.DataFrame):
    """
    Execute le pipeline complet : preparation, entrainement, sauvegarde.
    
    Args:
        df: DataFrame nettoye charge depuis database.py
    
    Returns:
        resultats du pipeline
    """
    print("=" * 60)
    print("  SMARTAIR CAMEROON - Pipeline d'Entrainement ML")
    print("=" * 60)

    debut_total = time.time()

    # Etape 1 : Preparer les donnees
    X_train, X_test, y_train, y_test, scaler, feature_names, df_enrichi = (
        preparer_donnees(df)
    )

    # Etape 2 : Entrainer les modeles
    meilleur_modele, meilleur_nom, resultats = entrainer_modeles(
        X_train, y_train, X_test, y_test
    )

    # Etape 3 : Sauvegarder
    sauvegarder_modele(meilleur_modele, scaler, feature_names, resultats, meilleur_nom)

    duree_totale = time.time() - debut_total
    print(f"\n{'=' * 60}")
    print(f"  Pipeline termine en {duree_totale:.2f} secondes")
    print(f"{'=' * 60}")

    return {
        "meilleur_modele": meilleur_nom,
        "resultats": resultats,
        "nombre_features": len(feature_names),
        "taille_train": len(X_train),
        "taille_test": len(X_test),
        "duree_totale": round(duree_totale, 2),
    }
