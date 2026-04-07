"""
Routes pour les previsions a j+7.
"""

from fastapi import APIRouter, HTTPException, Query
from backend.services.ml_service import prevoir_jours, est_modele_charge
from backend.app.database import charger_donnees

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/{ville}")
async def previsions(ville: str, jours: int = Query(7, ge=1, le=14)):
    """
    Fournit des previsions de pollution pour les prochains jours.
    """
    if not est_modele_charge():
        raise HTTPException(status_code=503, detail="Modele non disponible")
        
    df = charger_donnees()
    df_ville = df[df["city"] == ville]
    
    if df_ville.empty:
        raise HTTPException(status_code=404, detail="Ville introuvable")
        
    previsions_journalieres = prevoir_jours(df_ville, jours)
    
    return {
        "ville": ville,
        "jours": jours,
        "previsions": previsions_journalieres
    }
