// public/js/locations/delete.js
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location. search);
    const locationId = urlParams.get('id');
    
    const loading = document.getElementById('loading');
    const deleteContent = document.getElementById('deleteContent');
    const locationDetails = document.getElementById('locationDetails');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const alertContainer = document.getElementById('alert-container');

    if (!locationId) {
        window.location.href = 'list.html';
        return;
    }

    await loadLocation();

    async function loadLocation() {
        try {
            const [locationRes, eventsRes] = await Promise.all([
                fetch(`/api/locations/${locationId}`),
                fetch('/api/events')
            ]);

            const location = await locationRes.json();
            const events = await eventsRes.json();

            const locationEvents = events.filter(e => e.location_id == locationId);
            
            displayLocationDetails(location, locationEvents);
            loading.style.display = 'none';
            deleteContent.style. display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement du lieu');
            console.error(error);
        }
    }

    function displayLocationDetails(location, locationEvents) {
        locationDetails. innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: var(--danger);">Détails du lieu à supprimer :</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div>
                    <strong>📍 Nom:</strong><br>
                    ${location.name}
                </div>
                <div>
                    <strong>🏙️ Ville:</strong><br>
                    ${location.city}
                </div>
                <div>
                    <strong>📍 Département:</strong><br>
                    ${location.department}
                </div>
                <div>
                    <strong>👥 Capacité:</strong><br>
                    ${location. capacity} places
                </div>
                <div>
                    <strong>📅 Événements:</strong><br>
                    <span class="badge ${locationEvents.length > 0 ?  'badge-danger' : ''}" style="${locationEvents.length === 0 ? 'background: #6b728020; color: #6b7280;' : ''}">${locationEvents.length} événement(s)</span>
                </div>
            </div>
            ${location.address ? `
                <div style="margin-bottom: 16px;">
                    <strong>📍 Adresse:</strong><br>
                    ${location.address}
                </div>
            ` : ''}
            ${locationEvents.length > 0 ?  `
                <div class="alert alert-danger">
                    <strong>⚠️ Événements associés :</strong><br>
                    Ce lieu est utilisé par ${locationEvents.length} événement(s).  Vous ne pouvez pas le supprimer :
                    <ul style="margin: 8px 0 0 20px;">
                        ${locationEvents.map(event => `<li>${event.name} - ${formatDateTime(event.start_date)}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 12px;"><strong>Veuillez d'abord supprimer ou déplacer ces événements.</strong></p>
                </div>
            ` : ''}
        `;

        // Désactiver le bouton de suppression s'il y a des événements
        if (locationEvents.length > 0) {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<span class="btn-text">🚫 Impossible de supprimer</span>';
            confirmDeleteBtn.classList.remove('btn-danger');
            confirmDeleteBtn.classList.add('btn-secondary');
        }
    }

    function formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function showAlert(type, message) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }

    // Confirmation de suppression
    confirmDeleteBtn.addEventListener('click', async function() {
        const btnText = confirmDeleteBtn.querySelector('. btn-text');
        const loadingIcon = confirmDeleteBtn.querySelector('.loading');
        
        confirmDeleteBtn.disabled = true;
        btnText.style.display = 'none';
        loadingIcon.style.display = 'inline-block';
        
        try {
            const response = await fetch(`/api/locations/${locationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Lieu supprimé avec succès !');
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            showAlert('danger', 'Erreur : ' + error.message);
        } finally {
            confirmDeleteBtn.disabled = false;
            btnText.style.display = 'inline';
            loadingIcon.style.display = 'none';
        }
    });
});