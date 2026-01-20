# Application Minimale MongoDB - Node.js + Express

Application web simple pour afficher des documents MongoDB avec Node.js.

## 🎯 Fonctionnalités

- ✅ Backend Node.js + Express
- ✅ Driver MongoDB officiel
- ✅ Connexion sécurisée à MongoDB Atlas
- ✅ Interface HTML/CSS/JS moderne et responsive
- ✅ API REST pour les livres

## 🚀 Installation et Configuration

### Étape 1 : Installation des dépendances

```bash
npm install
```

### Étape 2 : Configuration

Éditez le fichier `.env` et renseignez l'URI pour accéder à MongoDB :

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.<region>.mongodb.net/?appName=<app_name>
PORT=3000
```

### Étape 3 : Lancer l'application

```bash
npm start
```

Ou en mode développement avec auto-reload :

```bash
npm run dev
```

### Étape 4 : Accéder à l'application

Ouvrez votre navigateur sur : **http://localhost:3000**

## 📝 Structure des données

### Collection `livres`

```json
{
  "_id": {
    "$oid": "650217e33afc06d6428cca68"
  },
  "datasetid": "les_1000_titres_les_plus_reserves_en_2013",
  "recordid": "788c881f49aac1df350edd799a7ce6d4295252a1",
  "fields": {
    "nombre_de_reservations": 52,
    "rang": 632,
    "titre_avec_lien_vers_le_catalogue": "Crépuscule",
    "auteur": "Hunter, Erin",
    "type_de_document": "Livre jeunesse"
  },
  "record_timestamp": "2016-08-27T18:20:35+02:00"
}
```

## 🛣️ Routes API

- `GET /api/livres` - Récupère tous les livres (max 100)
- `GET /api/livres/search?q=terme` - Recherche dans les titres et auteurs
- `GET /api/stats` - Statistiques sur la collection

## 🔐 Sécurité

✅ Les credentials MongoDB sont stockés dans `.env` (pas dans le code)  
✅ Le fichier `.env` est dans `.gitignore` (pas versionné)  
✅ CORS activé pour le développement local

## 📚 Ressources

- [MongoDB Atlas Data API](https://www.mongodb.com/docs/atlas/app-services/data-api/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Documentation MongoDB](https://docs.mongodb.com/)
� Structure du projet

```
MinimalApp/
├── .env                 # Configuration (mot de passe MongoDB)
├── .gitignore          # Fichiers à ignorer par Git
├── package.json        # Dépendances Node.js
├── server.js           # Backend Express + MongoDB
├── index.html          # Interface utilisateur
├── style.css           # Styles
├── app.js              # JavaScript frontend
└── README.md           # Documentation
```

## 📚 Ressources

- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas