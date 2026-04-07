"""
Routes pour effectuer des predictions temps reel.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.services.ml_service import predire, est_modele_charge

router = APIRouter(prefix="/predict", tags=["Prediction"])

class PredictionRequest(BaseModel):
    ville: str
    temperature: float
    vent: float
    pluie: float
    humidite: Optional[float] = 0.0
    radiation: Optional[float] = 0.0
    temperature_max: Optional[float] = None
    temperature_min: Optional[float] = None

@router.post("/")
async def faire_prediction(req: PredictionRequest):
    """
    Interroge le modele de Machine Learning pour predire le proxy PM2.5.
    """
    if not est_modele_charge():
        raise HTTPException(
            status_code=503, 
            detail="Le modele ML n'est pas encore entraine ou charge."
        )
        
    try:
        # Convertir la requete pydantic en dictionnaire
        resultat = predire(req.model_dump())
        resultat["input_ville"] = req.ville
        return resultat
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
