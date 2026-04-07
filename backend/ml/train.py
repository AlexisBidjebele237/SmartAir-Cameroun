"""
Script d'entrainement du modele SMARTAIR CAMEROON.
Peut etre execute directement : py -m backend.ml.train
"""

import sys
from pathlib import Path

# Ajouter le dossier racine au path pour les imports
racine = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(racine))

from backend.app.database import charger_donnees
from backend.ml.pipeline import executer_pipeline


def main():
    """Point d'entree principal pour l'entrainement."""
    print("\n")
    print("*" * 60)
    print("  SMARTAIR CAMEROON")
    print("  Plateforme de Prediction de la Qualite de l'Air")
    print("  Script d'Entrainement du Modele")
    print("*" * 60)

    # Etape 1 : Charger les donnees
    print("\n[ETAPE 1] Chargement des donnees...")
    df = charger_donnees(forcer_reload=True)
    print(f"  Dataset charge : {len(df)} lignes, {len(df.columns)} colonnes")
    print(f"  Villes : {df['city'].nunique()}")
    print(f"  Regions : {df['region'].nunique()}")
    print(f"  Periode : {df['time'].min()} a {df['time'].max()}")

    # Etape 2 : Executer le pipeline
    print("\n[ETAPE 2] Execution du pipeline ML...")
    resultats = executer_pipeline(df)

    # Etape 3 : Afficher le resume
    print("\n")
    print("*" * 60)
    print("  RESUME DE L'ENTRAINEMENT")
    print("*" * 60)
    print(f"  Meilleur modele    : {resultats['meilleur_modele']}")
    print(f"  Nombre de features : {resultats['nombre_features']}")
    print(f"  Taille train       : {resultats['taille_train']}")
    print(f"  Taille test        : {resultats['taille_test']}")
    print(f"  Duree totale       : {resultats['duree_totale']}s")
    print()
    print("  Resultats par modele :")
    for nom, metriques in resultats["resultats"].items():
        print(f"    {nom}:")
        print(f"      RMSE : {metriques['rmse']}")
        print(f"      MAE  : {metriques['mae']}")
        print(f"      R2   : {metriques['r2']}")
    print("*" * 60)
    print("  Modele sauvegarde avec succes !")
    print("*" * 60)


if __name__ == "__main__":
    main()
