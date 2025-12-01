// public/js/attendees/list.js
document.addEventListener('DOMContentLoaded', async function() {
    const tableBody = document.getElementById('attendeesTableBody');
    const searchInput = document.getElementById('searchInput');
    const eventFilter = document.getElementById('eventFilter');
    const alertContainer = document.getElementById('alert-container');

    let allAttendees = [];
    let allEvents = [];

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
            displayAttendees(allAttendees);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showAlert('danger', 'Erreur lors du chargement des données');
        }
    }

    function populateEventFilter() {
        allEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${formatDateTime(event.start_date)}`;
            eventFilter.appendChild(option);
        });
    }

    function displayAttendees(attendees) {
        if (attendees.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--muted);">
                        Aucun participant trouvé
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = attendees.map(attendee => {
            const event = allEvents.find(e => e.id == attendee.event_id);
            const eventStatus = event ? getEventStatus(event) : 'unknown';
            
            return `
                <tr>
                    <td>
                        <strong>${attendee.first_name} ${attendee.last_name}</strong>
                    </td>
                    <td>
                        <a href="mailto:${attendee.email}" style="color: var(--primary); text-decoration: none;">
                            ${attendee.email}
                        </a>
                    </td>
                    <td>
                        <a href="tel:${attendee.phone}" style="color: var(--primary); text-decoration: none;">
                            ${attendee.phone}
                        </a>
                    </td>
                    <td>
                        ${event ? `
                            <div>
                                <strong>${event.name}</strong><br>
                                <small style="color: var(--muted);">${formatDateTime(event.start_date)}</small><br>
                                ${getStatusBadge(eventStatus)}
                            </div>
                        ` : '<span style="color: var(--danger);">Événement supprimé</span>'}
                    </td>
                    <td>
                        ${formatDateTime(attendee.registration_date)}
                    </td>
                    <td>
                        <div class="table-actions">
                            <a href="edit.html?id=${attendee.id}" class="btn btn-sm btn-secondary">✏️ Modifier</a>
                            <button onclick="deleteAttendee(${attendee.id})" class="btn btn-sm btn-danger">🗑️ Supprimer</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getEventStatus(event) {
        const now = new Date();
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        if (now < startDate) return 'upcoming';
        if (now >= startDate && now <= endDate) return 'ongoing';
        return 'past';
    }

    function getStatusBadge(status) {
        const badges = {
            upcoming: '<span class="badge badge-warning">À venir</span>',
            ongoing: '<span class="badge badge-success">En cours</span>',
            past: '<span class="badge" style="background: #6b728020; color: #6b7280;">Terminé</span>',
            unknown: '<span class="badge" style="background: #ef444420; color: #ef4444;">Inconnu</span>'
        };
        return badges[status] || '';
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

    // Filtres
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedEventId = eventFilter.value;

        const filtered = allAttendees.filter(attendee => {
            const matchesSearch = 
                attendee.first_name.toLowerCase().includes(searchTerm) ||
                attendee.last_name.toLowerCase().includes(searchTerm) ||
                attendee.email.toLowerCase().includes(searchTerm);
            
            const matchesEvent = ! selectedEventId || attendee.event_id == selectedEventId;

            return matchesSearch && matchesEvent;
        });

        displayAttendees(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    eventFilter.addEventListener('change', applyFilters);

    // Fonction globale pour suppression
    window.deleteAttendee = async function(id) {
        if (! confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) return;

        try {
            const response = await fetch(`/api/attendees/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('success', 'Participant supprimé avec succès');
                allAttendees = allAttendees.filter(a => a.id != id);
                applyFilters();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            showAlert('danger', 'Erreur lors de la suppression');
        }
    };
});