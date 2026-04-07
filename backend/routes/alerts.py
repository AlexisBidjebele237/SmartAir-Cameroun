"""
Routes pour le systeme d'alertes.
"""

from fastapi import APIRouter
from backend.services.alert_service import obtenir_resume_alertes
from backend.services.data_service import obtenir_donnees

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/")
async def alertes():
    """
    Retourne le resume des alertes actives pour toutes les villes
    basees sur les dernieres observations et le niveau proxy de pm2.5.
    """
    df = obtenir_donnees()
    return obtenir_resume_alertes(df)
