// public/js/attendees/list.js - VERSION AVEC EMAIL/TÉLÉPHONE OPTIONNELS
document.addEventListener('DOMContentLoaded', async function() {
    const tableBody = document.getElementById('attendeesTableBody');
    const searchInput = document.getElementById('searchInput');
    const eventFilter = document.getElementById('eventFilter');
    const alertContainer = document.getElementById('alert-container');
    const mainTitle = document.querySelector('.main-title');

    // Récupérer l'ID événement depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    const eventFilterParam = urlParams.get('event');

    let allAttendees = [];
    let allEvents = [];
    let currentEventFilter = eventFilterParam;

    // Afficher message de succès si présent
    const successMessage = localStorage.getItem('success-message');
    if (successMessage) {
        showAlert('success', successMessage);
        localStorage.removeItem('success-message');
    }

    // Charger les données
    await loadData();

    async function loadData() {
        try {
            const [attendeesRes, eventsRes] = await Promise.all([
                fetch('/api/attendees'),
                fetch('/api/events')
            ]);

            allAttendees = await attendeesRes.json();
            allEvents = await eventsRes.json();

            populateEventFilter();
            
            // Si on a un filtre événement dans l'URL, l'appliquer
            if (currentEventFilter) {
                const selectedEvent = allEvents.find(e => e.id == currentEventFilter);
                if (selectedEvent) {
                    mainTitle.textContent = `Participants - ${selectedEvent.name}`;
                    eventFilter.value = currentEventFilter;
                }
            }
            
            displayAttendees();
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showAlert('danger', 'Erreur lors du chargement des données');
        }
    }

    // ===== NOUVELLES FONCTIONS POUR GÉRER LES CHAMPS OPTIONNELS ===== 
    function displayEmail(email) {
        if (! email || email.trim() === '') {
            return '<span style="color: var(--muted); font-style: italic; font-size: 12px;">Non renseigné</span>';
        }
        return `<a href="mailto:${email}" class="email-link">${email}</a>`;
    }

    function displayPhone(phone) {
        if (!phone || phone.trim() === '') {
            return '<span style="color: var(--muted); font-style: italic; font-size: 12px;">Non renseigné</span>';
        }
        return `<a href="tel:${phone}" class="phone-link">${phone}</a>`;
    }

    function populateEventFilter() {
        // Garder l'option "Tous les événements"
        eventFilter.innerHTML = '<option value="">Tous les événements</option>';
        
        allEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${formatDate(event.start_date)}`;
            eventFilter.appendChild(option);
        });
    }

    function displayAttendees() {
        const filteredAttendees = getFilteredAttendees();

        if (filteredAttendees.length === 0) {
            const messageText = currentEventFilter ?   
                'Aucun participant inscrit à cet événement' : 
                'Aucun participant trouvé';
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--muted);">
                        ${messageText}
                    </td>
                </tr>
            `;
            return;
        }

        // Calculer les statistiques si on filtre par événement
        let statsHtml = '';
        if (currentEventFilter) {
            const totalPeople = filteredAttendees.reduce((sum, a) => sum + (a.companions_count || 1), 0);
            const event = allEvents.find(e => e.id == currentEventFilter);
            const capacity = event?.location_capacity || 0;
            
            statsHtml = `
                <tr>
                    <td colspan="7" style="padding: 0; border: none;">
                        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(249, 168, 212, 0.1) 100%); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                                <div style="text-align: center; padding: 12px; background: rgba(255, 255, 255, 0.7); border-radius: 8px;">
                                    <div style="font-size: 28px; font-weight: bold; color: var(--primary);">${filteredAttendees.length}</div>
                                    <div style="font-size: 14px; color: var(--muted); font-weight: 600;">Participants inscrits</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(255, 255, 255, 0.7); border-radius: 8px;">
                                    <div style="font-size: 28px; font-weight: bold; color: var(--secondary);">${totalPeople}</div>
                                    <div style="font-size: 14px; color: var(--muted); font-weight: 600;">Total de personnes</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(255, 255, 255, 0.7); border-radius: 8px;">
                                    <div style="font-size: 28px; font-weight: bold; color: ${capacity > 0 && totalPeople >= capacity ? 'var(--danger)' : '#10b981'};">${capacity > 0 ?  capacity - totalPeople : 'N/A'}</div>
                                    <div style="font-size: 14px; color: var(--muted); font-weight: 600;">Places restantes</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(255, 255, 255, 0.7); border-radius: 8px;">
                                    <div style="font-size: 28px; font-weight: bold; color: var(--accent);">${capacity > 0 ? Math.round((totalPeople / capacity) * 100) : 0}%</div>
                                    <div style="font-size: 14px; color: var(--muted); font-weight: 600;">Taux de remplissage</div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }

        tableBody.innerHTML = statsHtml + filteredAttendees.map(attendee => {
            const event = allEvents.find(e => e.id === attendee.event_id);
            const eventName = event ?   event.name : 'Événement supprimé';
            
            return `
                <tr>
                    <td><strong>${attendee.last_name}</strong></td>
                    <td>${attendee.first_name}</td>
                    <td>
                        ${displayEmail(attendee.email)}
                    </td>
                    <td>
                        ${displayPhone(attendee.phone)}
                    </td>
                    <td class="companions-cell">
                        <span class="companions-badge">
                            ${attendee.companions_count || 1} 
                            ${(attendee.companions_count || 1) > 1 ? 'personnes' : 'personne'}
                        </span>
                    </td>
                    <td>
                        ${currentEventFilter ? formatDateTime(attendee.registration_date) : 
                          `<div style="margin-bottom: 4px;"><strong>${eventName}</strong></div>
                           <div style="font-size: 12px; color: var(--muted);">${formatDateTime(attendee.registration_date)}</div>`}
                    </td>
                    <td>
                        <div class="table-actions">
                            <a href="view.html?id=${attendee.id}" class="btn btn-sm">👁️ Voir</a>
                            <a href="edit.html?id=${attendee.id}" class="btn btn-sm">✏️ Modifier</a>
                            <button onclick="deleteAttendee(${attendee.id})" class="btn btn-sm">🗑️ Supprimer</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getFilteredAttendees() {
        const searchTerm = searchInput.value.toLowerCase();
        
        return allAttendees.filter(attendee => {
            // Filtre par événement (URL ou sélecteur)
            const matchesEvent = ! currentEventFilter || attendee.event_id == currentEventFilter;
            
            // Filtre par recherche (gérer les champs null/vides)
            const firstName = (attendee.first_name || '').toLowerCase();
            const lastName = (attendee.last_name || '').toLowerCase();
            const email = (attendee.email || '').toLowerCase();
            const phone = (attendee.phone || '').toLowerCase();
            
            const matchesSearch = 
                firstName.includes(searchTerm) ||
                lastName.includes(searchTerm) ||
                email.includes(searchTerm) ||
                phone.includes(searchTerm);

            return matchesEvent && matchesSearch;
        });
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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

    // Gestionnaires d'événements pour les filtres
    searchInput.addEventListener('input', displayAttendees);
    
    eventFilter.addEventListener('change', function() {
        currentEventFilter = this.value;
        
        // Mettre à jour le titre
        if (currentEventFilter) {
            const selectedEvent = allEvents.find(e => e.id == currentEventFilter);
            mainTitle.textContent = selectedEvent ? 
                `Participants - ${selectedEvent.name}` : 'Participants';
        } else {
            mainTitle.textContent = 'Participants';
        }
        
        displayAttendees();
    });

    // Fonction globale pour suppression
    window.deleteAttendee = async function(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) return;

        try {
            const response = await fetch(`/api/attendees/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('success', 'Participant supprimé avec succès');
                allAttendees = allAttendees.filter(a => a.id != id);
                displayAttendees();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            showAlert('danger', 'Erreur lors de la suppression : ' + error.message);
        }
    };
});