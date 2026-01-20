const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Sert les fichiers HTML/CSS/JS

// Client MongoDB
let db;
const client = new MongoClient(process.env.MONGODB_URI);

// Connexion à MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db('test');
        console.log('✅ Connecté à MongoDB Atlas');
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
}

// Routes API
app.get('/api/livres', async (req, res) => {
    try {
        const { type, page = 1, limit = 9, sort = 'alpha', search = '', disponibilite = 'tous' } = req.query;
        const query = {};
        
        // Filtre par type si spécifié
        if (type && type !== 'tous') {
            query['fields.type_de_document'] = type;
        }
        
        // Filtre par disponibilité
        if (disponibilite === 'disponible') {
            query.FIELD9 = { $in: ['', null] };
        } else if (disponibilite === 'emprunte') {
            query.FIELD9 = { $ne: '', $exists: true, $not: { $eq: null } };
        }
        
        // Filtre de recherche
        if (search) {
            query.$or = [
                { 'fields.titre_avec_lien_vers_le_catalogue': { $regex: search, $options: 'i' } },
                { 'fields.auteur': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Définir le tri
        let sortOption = {};
        if (sort === 'reservations') {
            sortOption = { 'fields.nombre_de_reservations': -1 };
        } else {
            sortOption = { 'fields.titre_avec_lien_vers_le_catalogue': 1 };
        }
        
        // Calculer le skip pour la pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Récupérer le nombre total de documents
        const total = await db.collection('livres').countDocuments(query);
        
        // Récupérer les documents
        const livres = await db.collection('livres')
            .find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();
        
        res.json({
            success: true,
            count: livres.length,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: livres
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour récupérer les types distincts
app.get('/api/livres/types', async (req, res) => {
    try {
        const types = await db.collection('livres')
            .distinct('fields.type_de_document');
        
        res.json({
            success: true,
            count: types.length,
            data: types.filter(t => t) // Enlever les valeurs null/undefined
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour rechercher
app.get('/api/livres/search', async (req, res) => {
    try {
        const { q, type } = req.query;
        const query = {};
        
        // Filtre de recherche par texte
        if (q) {
            query.$or = [
                { 'fields.titre_avec_lien_vers_le_catalogue': { $regex: q, $options: 'i' } },
                { 'fields.auteur': { $regex: q, $options: 'i' } }
            ];
        }
        
        // Filtre par type de document
        if (type && type !== 'tous') {
            query['fields.type_de_document'] = type;
        }
        
        const livres = await db.collection('livres')
            .find(query)
            .limit(100)
            .toArray();
        
        res.json({
            success: true,
            count: livres.length,
            data: livres
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour emprunter/retourner un livre
app.patch('/api/livres/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        
        const ObjectId = require('mongodb').ObjectId;
        const update = {};
        
        if (action === 'emprunter') {
            update.FIELD9 = new Date().toISOString();
        } else if (action === 'retourner') {
            update.FIELD9 = '';
        } else {
            return res.status(400).json({
                success: false,
                error: 'Action invalide'
            });
        }
        
        const result = await db.collection('livres').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Document non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: action === 'emprunter' ? 'Livre emprunté' : 'Livre retourné'
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour les statistiques
app.get('/api/stats', async (req, res) => {
    try {
        const totalLivres = await db.collection('livres').countDocuments();
        
        const topAuteurs = await db.collection('livres').aggregate([
            { $group: { 
                _id: '$fields.auteur', 
                count: { $sum: 1 } 
            }},
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();
        
        const typesDocuments = await db.collection('livres').aggregate([
            { $group: { 
                _id: '$fields.type_de_document', 
                count: { $sum: 1 } 
            }},
            { $sort: { count: -1 } }
        ]).toArray();
        
        // Statistiques de réservations par type
        const reservationsParType = await db.collection('livres').aggregate([
            {
                $group: {
                    _id: '$fields.type_de_document',
                    totalReservations: { 
                        $sum: { 
                            $toInt: { 
                                $ifNull: ['$fields.nombre_de_reservations', 0] 
                            } 
                        } 
                    },
                    nombreDocuments: { $sum: 1 },
                    moyenneReservations: {
                        $avg: {
                            $toInt: {
                                $ifNull: ['$fields.nombre_de_reservations', 0]
                            }
                        }
                    }
                }
            },
            { $sort: { totalReservations: -1 } }
        ]).toArray();
        
        res.json({
            success: true,
            stats: {
                totalLivres,
                topAuteurs,
                typesDocuments,
                reservationsParType
            }
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Démarrage du serveur
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
});

// Gestion de la fermeture
process.on('SIGINT', async () => {
    await client.close();
    console.log('\n👋 Connexion MongoDB fermée');
    process.exit(0);
});
