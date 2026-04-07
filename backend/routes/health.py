"""
Route de sante globale de l'API.
"""

from fastapi import APIRouter
from backend.services.ml_service import est_modele_charge, obtenir_metadata

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
async def verifier_sante():
    """
    Verifie l'etat de l'API et du modele ML.
    """
    modele_charge = est_modele_charge()
    metadata = obtenir_metadata() if modele_charge else {}
    
    return {
        "statut": "en ligne",
        "modele_ml": {
            "charge": modele_charge,
            "nom": metadata.get("nom_modele", "Aucun"),
            "features": metadata.get("nombre_features", 0)
        }
    }
