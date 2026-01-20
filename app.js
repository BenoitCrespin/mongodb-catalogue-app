// ============================================
// CONFIGURATION API
// ============================================
const CONFIG = {
    apiUrl: '/api',
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 9
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

// Fonction pour afficher un message de statut
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

// Fonction pour mettre à jour les boutons de pagination
function updatePagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    prevBtn.disabled = CONFIG.currentPage <= 1;
    nextBtn.disabled = CONFIG.currentPage >= CONFIG.totalPages;
    pageInfo.textContent = `Page ${CONFIG.currentPage} / ${CONFIG.totalPages}`;
}

// Fonction pour charger les types disponibles
async function loadTypes() {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/livres/types`);
        if (!response.ok) return;
        
        const result = await response.json();
        if (result.success && result.data) {
            const typeSelect = document.getElementById('typeSelect');
            
            // Ajouter les options de type
            result.data.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erreur chargement types:', error);
    }
}

// Fonction pour charger les documents depuis MongoDB
async function loadDocuments(collection, page = 1) {
    showStatus('⏳ Chargement des documents...', 'loading');
    const resultsEl = document.getElementById('results');
    resultsEl.innerHTML = '';

    try {
        const typeSelect = document.getElementById('typeSelect');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('searchInput');
        const disponibiliteSelect = document.getElementById('disponibiliteSelect');
        
        const selectedType = typeSelect ? typeSelect.value : 'tous';
        const selectedSort = sortSelect ? sortSelect.value : 'alpha';
        const searchQuery = searchInput ? searchInput.value : '';
        const selectedDisponibilite = disponibiliteSelect ? disponibiliteSelect.value : 'tous';
        
        // Construire l'URL avec tous les paramètres
        const params = new URLSearchParams({
            page: page,
            limit: CONFIG.itemsPerPage,
            sort: selectedSort,
            disponibilite: selectedDisponibilite
        });
        
        if (selectedType && selectedType !== 'tous') {
            params.append('type', selectedType);
        }
        
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        
        const url = `${CONFIG.apiUrl}/${collection}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        // Mettre à jour les informations de pagination
        CONFIG.currentPage = result.page || 1;
        CONFIG.totalPages = result.totalPages || 1;
        
        if (result.success && result.data && result.data.length > 0) {
            showStatus(`✅ ${result.count} document(s) sur ${result.total} (page ${result.page}/${result.totalPages})`, 'success');
            displayDocuments(result.data, collection);
            updatePagination();
        } else {
            showStatus('ℹ️ Aucun document trouvé', 'info');
            resultsEl.innerHTML = '<div class="empty-state">Aucun document trouvé</div>';
            updatePagination();
        }

    } catch (error) {
        console.error('Erreur:', error);
        showStatus(`❌ Erreur: ${error.message}`, 'error');
        resultsEl.innerHTML = `
            <div class="config-note">
                <h3>❌ Serveur non disponible</h3>
                <p>Assurez-vous que le serveur Node.js est démarré :</p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>Ouvrez un terminal dans le dossier du projet</li>
                    <li>Lancez <code>npm install</code></li>
                    <li>Modifiez le fichier <code>.env</code> avec votre mot de passe MongoDB</li>
                    <li>Lancez <code>npm start</code></li>
                </ol>
                <p style="margin-top: 10px;">
                    <strong>Erreur actuelle:</strong> ${error.message}
                </p>
            </div>
        `;
    }
}

// Fonction pour emprunter/retourner un livre
async function toggleEmprunt(id, action) {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/livres/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Recharger les documents
            loadDocuments('livres', CONFIG.currentPage);
        } else {
            alert('Erreur: ' + result.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'opération: ' + error.message);
    }
}

// Fonction pour afficher les documents
function displayDocuments(documents, collection) {
    const resultsEl = document.getElementById('results');
    
    documents.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'document-card';
        
        // Les données sont dans doc.fields
        const fields = doc.fields || {};
        const estEmprunte = doc.FIELD9 && doc.FIELD9 !== '';
        
        let content = `<h3>${fields.titre_avec_lien_vers_le_catalogue || 'Sans titre'}</h3>`;
        
        // Badge de statut
        const statutClass = estEmprunte ? 'statut-emprunte' : 'statut-disponible';
        const statutText = estEmprunte ? '📤 Emprunté' : '✅ Disponible';
        content += `<div class="statut-badge ${statutClass}">${statutText}</div>`;
        
        // Afficher les informations du livre
        if (collection === 'livres') {
            content += `
                ${fields.auteur ? `<p><span class="label">Auteur:</span> ${fields.auteur}</p>` : ''}
                ${fields.type_de_document ? `<p><span class="label">Type:</span> ${fields.type_de_document}</p>` : ''}
                ${fields.nombre_de_reservations ? `<p><span class="label">Réservations:</span> ${fields.nombre_de_reservations}</p>` : ''}
                ${fields.rang ? `<p><span class="label">Rang:</span> ${fields.rang}</p>` : ''}
            `;
            
            // Date d'emprunt si applicable
            if (estEmprunte) {
                const dateEmprunt = new Date(doc.FIELD9).toLocaleDateString('fr-FR');
                content += `<p class="date-emprunt">Emprunté le: ${dateEmprunt}</p>`;
            }
        }
        
        // Afficher l'ID MongoDB
        if (doc._id) {
            const idStr = doc._id.$oid || doc._id;
            content += `<div class="document-id">ID: ${idStr}</div>`;
        }
        
        card.innerHTML = content;
        
        // Ajouter le bouton d'action
        const btnAction = document.createElement('button');
        btnAction.className = estEmprunte ? 'btn-action btn-retourner' : 'btn-action btn-emprunter';
        btnAction.textContent = estEmprunte ? '↩️ Retourner' : '📤 Emprunter';
        btnAction.onclick = () => {
            const action = estEmprunte ? 'retourner' : 'emprunter';
            const docId = doc._id.$oid || doc._id;
            toggleEmprunt(docId, action);
        };
        card.appendChild(btnAction);
        
        resultsEl.appendChild(card);
    });
}

// ============================================
// ÉVÉNEMENTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('loadBtn');
    const typeSelect = document.getElementById('typeSelect');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    const disponibiliteSelect = document.getElementById('disponibiliteSelect');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Charger les types disponibles
    loadTypes();

    // Fonction de chargement avec reset de la page
    const reloadFromStart = () => {
        CONFIG.currentPage = 1;
        loadDocuments('livres', 1);
    };

    loadBtn.addEventListener('click', reloadFromStart);
    
    // Recharger quand le type, le tri ou la disponibilité change
    typeSelect.addEventListener('change', reloadFromStart);
    sortSelect.addEventListener('change', reloadFromStart);
    disponibiliteSelect.addEventListener('change', reloadFromStart);
    
    // Recherche avec délai pour éviter trop de requêtes
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(reloadFromStart, 500);
    });
    
    // Boutons de pagination
    prevBtn.addEventListener('click', () => {
        if (CONFIG.currentPage > 1) {
            loadDocuments('livres', CONFIG.currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (CONFIG.currentPage < CONFIG.totalPages) {
            loadDocuments('livres', CONFIG.currentPage + 1);
        }
    });

    // Charger les documents par défaut au démarrage
    loadDocuments('livres', 1);
});