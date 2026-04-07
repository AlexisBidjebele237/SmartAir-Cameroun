# 🌍 SmartAir Cameroon
### IA pour la Résilience Climatique et Sanitaire | AI for Climate & Health Resilience
**Soumission officielle - Hackathon IndabaX Cameroon 2026**

---

## 🎯 Vision du Projet
**SmartAir Cameroon** est une solution technologique innovante visant à combler le déficit de données sur la qualité de l'air au Cameroun. En utilisant l'Intelligence Artificielle (XGBoost), nous transformons les variables météorologiques standards en indicateurs de pollution (PM2.5), permettant une anticipation proactive des risques sanitaires liés au climat (Harmattan, pics de chaleur).

## 🚀 Fonctionnalités Clés
- **🔮 Moteur de Prédiction IA** : Modèle XGBoost haute précision (R²=0.99) pour estimer les niveaux de PM2.5.
- **🗺️ Carte de Chaleur Interactive** : Visualisation géographique des zones à risque sur l'ensemble du territoire camerounais.
- **🚦 Système d'Alertes OMS** : Détection automatique des dépassements de seuils sanitaires avec recommandations personnalisées.
- **📈 Dashboard Analytique & IA Explicable** : Corrélation dynamique et identification des facteurs influençant la pollution (Interpretability).
- **📡 Tendance 24h** : Système de prévision à court terme pour anticiper les pics de pollution demain.
- **📶 Mode Frugal (Éco)** : Option basse-bande passante remplaçant la carte Leaflet par une liste textuelle pour économiser les données mobiles.
- **📱 100% Responsive & Mobile-First** : Interface optimisée pour smartphone, tablette et desktop.
- **🐳 Dockerized** : Orchestration complète (Nginx, Backend, Frontend) pour un déploiement robuste.

## 🛠️ Architecture Technique
- **Backend** : FastAPI (Python 3.9+)
- **IA/ML** : XGBoost, Scikit-Learn, Pandas
- **Frontend** : Next.js 14, Tailwind CSS, Lucide React
- **Visualisation** : Leaflet.js (Cartographie), Recharts (Graphiques)

## 📦 Installation et Lancement

### 1. Prérequis
- Python 3.9+
- Node.js 18+
- Un environnement virtuel (`venv` recommandé)

### 2. Méthode Rapide (Docker Docker-Compose)
Si vous avez Docker installé, lancez tout l'écosystème SmartAir (Frontend + Backend + Nginx) en une ligne :
```bash
docker-compose up --build
```
Accédez ensuite à `http://localhost` (Port 80 par défaut).

### 3. Méthode Manuelle (Backend & Frontend)

#### Backend (API & ML)
```bash
cd backend
python -m venv .venv
# Sur Windows:
.\.venv\Scripts\activate
# Installation des dependances
pip install -r requirements.txt
# Lancement de l'API (port 8000)
python main.py
```

#### Frontend (Dashboard)
```bash
cd frontend
npm install
npm run dev
```
Accédez ensuite à `http://localhost:3000`

## 📊 Résultats du Modèle
| Métrique | Valeur |
|---|---|
| **Coefficient de Détermination (R²)** | 0.998 |
| **RMSE (Erreur Quadratique Moyenne)** | 0.207 |
| **Features utilisées** | 16 variables climatiques |

## 📁 Structure des Livrables
- 📝 [Rapport Technique](TECHNICAL_REPORT.md) : Détail de la méthodologie ML.


---
**Développé par l'Équipe SmartAir pour l'IndabaX Cameroon 2026.**
