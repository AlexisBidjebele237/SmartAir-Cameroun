"""
Routes pour les donnees historiques.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.services.data_service import (
    obtenir_historique,
    obtenir_statistiques_globales,
    obtenir_donnees_carte,
    obtenir_correlations,
    obtenir_derniere_meteo,
)

router = APIRouter(prefix="/data", tags=["Data"])

@router.get("/history/{ville}")
async def history(
    ville: str,
    date_debut: Optional[str] = Query(None, description="Format YYYY-MM-DD"),
    date_fin: Optional[str] = Query(None, description="Format YYYY-MM-DD")
):
    """Retourne l'historique meteorologique pour une ville."""
    donnees = obtenir_historique(ville, date_debut, date_fin)
    if not donnees:
        raise HTTPException(status_code=404, detail=f"Aucune donnee pour la ville {ville}")
    
    return {"ville": ville, "total": len(donnees), "historique": donnees}

@router.get("/stats")
async def stats():
    """Retourne les statistiques globales du dataset."""
    return obtenir_statistiques_globales()

@router.get("/map")
async def map_data():
    """Retourne les donnees recentes avec proxy PM2.5 pour l'affichage sur la carte."""
    donnees = obtenir_donnees_carte()
    return {"total": len(donnees), "marqueurs": donnees}

@router.get("/correlations")
async def correlations():
    """Retourne les correlations climat vs qualite de l'air pour les graphiques."""
    return obtenir_correlations()

@router.get("/current/{ville}")
async def current_weather(ville: str):
    """Retourne les conditions meteorologiques les plus recentes pour une ville."""
    donnees = obtenir_derniere_meteo(ville)
    if not donnees:
        raise HTTPException(status_code=404, detail=f"Aucune donnee pour la ville {ville}")
    return donnees
