"""
Point d'entree de l'application FastAPI SMARTAIR CAMEROON.
Configure les routes, le CORS et initialise les services au demarrage.
"""

import os
import sys
from pathlib import Path

# Ajouter le repertoire racine au path pour les imports absolus
racine = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(racine))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.config import API_TITRE, API_DESCRIPTION, API_VERSION, API_PREFIX
from backend.services.ml_service import initialiser_modele
from backend.services.data_service import obtenir_donnees

from backend.routes import health, cities, data, predict, forecast, alerts

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Execution au demarrage et a l'arret de l'API."""
    print(f"\n--- Demarrage {API_TITRE} ---")
    
    # 1. Charger les donnees (et creer le CSV cache si besoin)
    print("Chargement des donnees initiales...")
    try:
        obtenir_donnees()
        print(" Donnees pretes.")
    except Exception as e:
        print(f" Erreur chargement donnees : {e}")

    # 2. Charger le modele ML en memoire
    print("Initialisation du modele ML...")
    initialiser_modele()
    
    yield
    
    print(f"\n--- Arret {API_TITRE} ---")

# Initialisation de FastAPI
app = FastAPI(
    title=API_TITRE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan
)

# Configuration CORS pour autoriser le frontend (NextJS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, specifier l'URL du frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(cities.router, prefix=API_PREFIX)
app.include_router(data.router, prefix=API_PREFIX)
app.include_router(predict.router, prefix=API_PREFIX)
app.include_router(forecast.router, prefix=API_PREFIX)
app.include_router(alerts.router, prefix=API_PREFIX)

@app.get("/")
async def root():
    """Route par defaut qui redirige vers la documentation."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    # A n'utiliser qu'en dev. En production, utiliser "uvicorn backend.main:app"
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
