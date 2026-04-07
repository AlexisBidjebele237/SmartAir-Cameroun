"""
Routes pour les donnees des villes.
"""

from fastapi import APIRouter
from backend.services.data_service import obtenir_villes

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.get("/")
async def lister_villes():
    """
    Retourne la liste des 40 villes avec leurs coordonnees.
    """
    return {
        "total": len(obtenir_villes()),
        "villes": obtenir_villes()
    }
