# 🚀 Guide de Déploiement : SmartAir Cameroon (IndabaX 2026)

Ce document vous guide pas à pas pour mettre votre application en ligne gratuitement en utilisant **Render** (pour le Backend IA) et **Vercel** (pour le Dashboard Frontend).

---

## 📋 Prérequis
1. Un compte [GitHub](https://github.com/) avec votre projet poussé dessus.
2. Un compte gratuit sur [Render.com](https://render.com/).
3. Un compte gratuit sur [Vercel.com](https://vercel.com/).

---

## 🛠 Étape 1 : Mettre à jour GitHub
Avant de commencer, assurez-vous que les derniers changements (fichiers `requirements.txt` et `api.ts`) sont sur GitHub. Ouvez un terminal à la racine du projet et tapez :

```bash
git add .
git commit -m "chore: configuration finale pour le déploiement"
git push origin main
```

---

## 🐍 Étape 2 : Déployer le Backend sur Render
Le backend contient votre modèle d'IA et l'API FastAPI.

1. Allez sur votre **Dashboard Render** et cliquez sur **New +** > **Web Service**.
2. Connectez votre dépôt GitHub et sélectionnez `SmartAir-Cameroun`.
3. Configurez les champs suivants :
   - **Name** : `smartair-api` (ou ce que vous voulez)
   - **Root Directory** : `backend`
   - **Environment** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
4. Cliquez sur **Create Web Service**.
5. **Attendez** que le déploiement soit terminé (le statut deviendra "Live" en vert).
6. **Copiez l'URL** qui s'affiche en haut de la page (ex: `https://smartair-api.onrender.com`).

---

## 🎨 Étape 3 : Déployer le Frontend sur Vercel
Le frontend est votre dashboard interactif.

1. Allez sur votre **Dashboard Vercel** et cliquez sur **Add New** > **Project**.
2. Importez le dépôt `SmartAir-Cameroun`.
3. Dans la configuration du projet :
   - **Framework Preset** : `Next.js` (détecté automatiquement).
   - **Root Directory** : `frontend`.
4. **IMPORTANT :** Cliquez sur la section **Environment Variables** et ajoutez :
   - **Key** : `NEXT_PUBLIC_API_URL`
   - **Value** : Collez l'URL de votre API Render (ajoutée de `/api` à la fin).
     *Exemple :* `https://smartair-api.onrender.com/api`
5. Cliquez sur **Deploy**.

---

## ✅ Étape 4 : Vérification
Une fois que Vercel a terminé, il vous donnera une URL pour votre site (ex: `https://smartair-cameroun.vercel.app`).

1. Ouvrez votre site Vercel.
2. Allez sur la page **Carte** ou **Tableau de Bord**.
3. Si les données s'affichent, la communication entre le Front et le Back est réussie !

---

## 💡 Astuces Utiles
- **Le Backend s'endort** : Sur Render (version gratuite), votre API s'endort après 15 minutes d'inactivité. Le premier chargement de l'application pourrait prendre **30 à 40 secondes** le temps qu'elle se réveille.
- **Logs** : Si quelque chose ne marche pas, consultez l'onglet "Logs" sur Render ou Vercel pour voir les messages d'erreur.
- **Modifications** : À chaque fois que vous ferez un `git push` sur GitHub, Vercel et Render mettront à jour votre site automatiquement.

---
**Développé avec succès pour le Hackathon IndabaX Cameroun 2026.**
