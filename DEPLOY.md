# 📚 Application Catalogue MongoDB

Application web Node.js + Express + MongoDB Atlas pour gérer un catalogue de documents avec système d'emprunt et page de statistiques.

## 🚀 Fonctionnalités

- 📖 Catalogue de documents avec pagination
- 🔍 Recherche par titre ou auteur
- 📊 Filtres par type de document et disponibilité
- 📤 Système d'emprunt/retour
- 📈 Page de statistiques avec graphiques :
  - Nombre de documents par type
  - Réservations par type
  - Top 10 des auteurs

## 📦 Installation locale

### Prérequis
- Node.js (v14 ou supérieur)
- Compte MongoDB Atlas
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <votre-repo-url>
cd MinimalApp
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
PORT=3000
```

4. **Démarrer le serveur**
```bash
npm start
# ou en mode développement
npm run dev
```

5. **Accéder à l'application**
- Catalogue : http://localhost:3000
- Statistiques : http://localhost:3000/stats.html

## 🌐 Déploiement sur Render

### Étape 1 : Préparer le code

Votre code est déjà prêt ! Le fichier `.env.example` est inclus.

### Étape 2 : Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte gratuit (avec GitHub recommandé)

### Étape 3 : Créer un nouveau Web Service

1. Dans le dashboard Render, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre dépôt GitHub
3. Sélectionnez ce dépôt

### Étape 4 : Configuration du service

Remplissez les paramètres :

- **Name** : `mongodb-catalogue-app` (ou votre choix)
- **Region** : Choisissez la plus proche
- **Branch** : `main`
- **Root Directory** : laissez vide
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Instance Type** : `Free`

### Étape 5 : Variables d'environnement

Dans la section **Environment**, ajoutez :

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
PORT = 3000
```

⚠️ **Important** : Remplacez par vos vraies credentials MongoDB Atlas !

### Étape 6 : Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va :
   - Cloner votre dépôt
   - Installer les dépendances
   - Démarrer le serveur
3. Attendez que le déploiement soit terminé (🟢 vert)

### Étape 7 : Accéder à votre app

Votre URL sera : `https://votre-app-name.onrender.com`

### 🔄 Mises à jour automatiques

À chaque push sur la branche `main`, Render redéploiera automatiquement !

## 📝 Configuration MongoDB Atlas

### Autoriser les connexions Render

1. Allez dans MongoDB Atlas
2. **Network Access** → **Add IP Address**
3. Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Ou ajoutez les IPs de Render spécifiquement

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express.js
- **Base de données** : MongoDB Atlas
- **Frontend** : Vanilla JavaScript, HTML5, CSS3
- **Hébergement** : Render (gratuit)

## 📱 Structure du projet

```
MinimalApp/
├── server.js          # Serveur Express + Routes API
├── app.js             # Logique frontend catalogue
├── stats.js           # Logique frontend statistiques
├── index.html         # Page catalogue
├── stats.html         # Page statistiques
├── style.css          # Styles globaux
├── package.json       # Dépendances
└── .env.example       # Template variables d'env
```

## 🐛 Dépannage

### Erreur de connexion MongoDB
- Vérifiez votre `MONGODB_URI` dans `.env`
- Assurez-vous que l'IP est autorisée dans MongoDB Atlas
- Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés

### Le serveur ne démarre pas
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Installez les dépendances : `npm install`

### Déploiement Render échoue
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `npm start` fonctionne en local

## 📄 Licence

MIT

## 👤 Auteur

Développé pour le cours NoSQL - L315 - 3DW17
