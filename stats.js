// ============================================
// CONFIGURATION API
// ============================================
const CONFIG = {
    apiUrl: 'http://localhost:3000/api'
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Fonction pour afficher un message de statut
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

// Fonction pour générer une couleur basée sur l'index
function getColor(index) {
    const colors = [
        '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
        '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#3F51B5',
        '#8BC34A', '#FFC107', '#FF5722', '#673AB7', '#009688'
    ];
    return colors[index % colors.length];
}

// Fonction pour créer un graphique en barres horizontales
function createBarChart(containerId, data, labelKey, valueKey, showPercentage = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune donnée disponible</p>';
        return;
    }
    
    // Trouver la valeur maximale pour la mise à l'échelle
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    
    data.forEach((item, index) => {
        const value = item[valueKey] || 0;
        const label = item[labelKey] || 'Non défini';
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = label;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = `${percentage}%`;
        bar.style.backgroundColor = getColor(index);
        
        const barValue = document.createElement('span');
        barValue.className = 'bar-value';
        if (showPercentage) {
            const total = item.total || 0;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            barValue.textContent = `${value} (${percent}%)`;
        } else {
            barValue.textContent = value;
        }
        
        bar.appendChild(barValue);
        barWrapper.appendChild(bar);
        barContainer.appendChild(barLabel);
        barContainer.appendChild(barWrapper);
        container.appendChild(barContainer);
    });
}

// Fonction pour créer un graphique empilé (disponible/emprunté)
function createStackedBarChart(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune donnée disponible</p>';
        return;
    }
    
    data.forEach((item, index) => {
        const type = item._id || 'Non défini';
        const disponibles = item.disponibles || 0;
        const empruntes = item.empruntes || 0;
        const total = item.total || 0;
        
        if (total === 0) return;
        
        const percentDisponible = ((disponibles / total) * 100).toFixed(1);
        const percentEmprunte = ((empruntes / total) * 100).toFixed(1);
        
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = `${type} (${total})`;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper stacked';
        
        // Barre disponible
        const barDisponible = document.createElement('div');
        barDisponible.className = 'bar bar-disponible';
        barDisponible.style.width = `${percentDisponible}%`;
        barDisponible.style.backgroundColor = '#4CAF50';
        barDisponible.innerHTML = `<span class="bar-value">${disponibles} (${percentDisponible}%)</span>`;
        
        // Barre emprunté
        const barEmprunte = document.createElement('div');
        barEmprunte.className = 'bar bar-emprunte';
        barEmprunte.style.width = `${percentEmprunte}%`;
        barEmprunte.style.backgroundColor = '#FF5722';
        barEmprunte.innerHTML = `<span class="bar-value">${empruntes} (${percentEmprunte}%)</span>`;
        
        barWrapper.appendChild(barDisponible);
        barWrapper.appendChild(barEmprunte);
        barContainer.appendChild(barLabel);
        barContainer.appendChild(barWrapper);
        
        // Légende
        const legend = document.createElement('div');
        legend.className = 'bar-legend';
        legend.innerHTML = `
            <span class="legend-item">
                <span class="legend-color" style="background-color: #4CAF50;"></span>
                Disponibles: ${disponibles}
            </span>
            <span class="legend-item">
                <span class="legend-color" style="background-color: #FF5722;"></span>
                Empruntés: ${empruntes}
            </span>
        `;
        barContainer.appendChild(legend);
        
        container.appendChild(barContainer);
    });
}

// Fonction pour créer un graphique de réservations avec moyenne
function createReservationsChart(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune donnée disponible</p>';
        return;
    }
    
    const maxValue = Math.max(...data.map(item => item.totalReservations || 0));
    
    data.forEach((item, index) => {
        const type = item._id || 'Non défini';
        const totalReservations = item.totalReservations || 0;
        const nombreDocuments = item.nombreDocuments || 0;
        const moyenneReservations = item.moyenneReservations || 0;
        const percentage = maxValue > 0 ? (totalReservations / maxValue) * 100 : 0;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = type;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = `${percentage}%`;
        bar.style.backgroundColor = getColor(index);
        
        const barValue = document.createElement('span');
        barValue.className = 'bar-value';
        barValue.textContent = `${totalReservations} réservations`;
        
        bar.appendChild(barValue);
        barWrapper.appendChild(bar);
        barContainer.appendChild(barLabel);
        barContainer.appendChild(barWrapper);
        
        // Info supplémentaire
        const info = document.createElement('div');
        info.className = 'bar-info';
        info.innerHTML = `
            <small>
                ${nombreDocuments} document(s) • 
                Moyenne: ${moyenneReservations.toFixed(2)} réservation(s) par document
            </small>
        `;
        barContainer.appendChild(info);
        
        container.appendChild(barContainer);
    });
}

// ============================================
// CHARGEMENT DES STATISTIQUES
// ============================================

async function loadStats() {
    showStatus('⏳ Chargement des statistiques...', 'loading');
    
    try {
        const response = await fetch(`${CONFIG.apiUrl}/stats`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.stats) {
            showStatus('✅ Statistiques chargées avec succès', 'success');
            displayStats(result.stats);
        } else {
            throw new Error('Données invalides reçues du serveur');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showStatus(`❌ Erreur: ${error.message}`, 'error');
        document.querySelector('.stats-overview').innerHTML = `
            <div class="config-note">
                <h3>❌ Serveur non disponible</h3>
                <p>Assurez-vous que le serveur Node.js est démarré :</p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>Ouvrez un terminal dans le dossier du projet</li>
                    <li>Lancez <code>npm start</code></li>
                </ol>
                <p style="margin-top: 10px;">
                    <strong>Erreur actuelle:</strong> ${error.message}
                </p>
            </div>
        `;
    }
}

// Fonction pour afficher les statistiques
function displayStats(stats) {
    // Vue d'ensemble
    document.getElementById('totalDocuments').textContent = stats.totalLivres || 0;
    document.getElementById('totalTypes').textContent = stats.typesDocuments?.length || 0;
    
    // Calculer le total des réservations
    const totalReservations = stats.reservationsParType?.reduce(
        (sum, item) => sum + (item.totalReservations || 0), 
        0
    ) || 0;
    document.getElementById('totalReservations').textContent = totalReservations;
    
    // Graphiques
    createBarChart(
        'typesChart', 
        stats.typesDocuments, 
        '_id', 
        'count'
    );
    
    createReservationsChart(
        'reservationsChart',
        stats.reservationsParType
    );
    
    createBarChart(
        'auteursChart',
        stats.topAuteurs,
        '_id',
        'count'
    );
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    
    // Bouton de rechargement optionnel
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = '🔄 Actualiser';
    reloadBtn.className = 'reload-btn';
    reloadBtn.onclick = loadStats;
    document.querySelector('.navigation').appendChild(reloadBtn);
});
