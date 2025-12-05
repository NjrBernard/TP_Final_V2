// public/js/events/list.js
document.addEventListener('DOMContentLoaded', async function () {
    const tableBody = document.getElementById('eventsTableBody');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const alertContainer = document.getElementById('alert-container');

    let allEvents = [];
    let allCategories = [];
    let allLocations = [];

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
            const [eventsRes, categoriesRes, locationsRes] = await Promise.all([
                fetch('/api/events'),
                fetch('/api/categories'),
                fetch('/api/locations')
            ]);

            allEvents = await eventsRes.json();
            allCategories = await categoriesRes.json();
            allLocations = await locationsRes.json();

            populateCategoryFilter();
            displayEvents(allEvents);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showAlert('danger', 'Erreur lors du chargement des données');
        }
    }

    function populateCategoryFilter() {
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    function displayEvents(events) {
        if (events.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--muted);">
                    Aucun événement trouvé
                </td>
            </tr>
        `;
            return;
        }

        tableBody.innerHTML = events.map(event => {
            // Utilise les données venant du backend avec les JOINs
            const categoryName = event.category_name || 'Non définie';
            const categoryColor = event.category_color || '#6b7280';
            const locationInfo = event.location_name ?  `${event.location_name}, ${event.location_city}` : 'Non défini';

            const status = getEventStatus(event);

            // Calculs des participants
            const registeredCount = event.registered_count || 0;
            const locationCapacity = event.location_capacity || 0;
            const remainingPlaces = locationCapacity - registeredCount;
            const progressPercent = locationCapacity > 0 ? (registeredCount / locationCapacity) * 100 : 0;

            return `
            <tr>
                <td><strong>${event.name}</strong></td>
                <td>${formatDateTime(event.start_date)}</td>
                <td>${formatDateTime(event.end_date)}</td>
                <td>${locationInfo}</td>
                <td>
                    <span class="badge" style="background: ${categoryColor}20; color: ${categoryColor};">
                        ${categoryName}
                    </span>
                </td>
                <td class="participants-cell">
                    <div class="participants-info">
                        <div class="participants-count">
                            <span class="icon-participants"></span>
                            ${registeredCount}/${locationCapacity}
                        </div>
                        <div class="participants-remaining ${remainingPlaces <= 0 ? 'full' : ''}">
                            <span class="icon-remaining"></span>
                            ${remainingPlaces > 0 ? `${remainingPlaces} restantes` : 'Complet'}
                        </div>
                        <div class="participants-bar">
                            <div class="participants-progress" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </td>
                <td>${getStatusBadge(status)}</td>
                <td>
                    <div class="table-actions">
                        <a href="../attendees/list.html?event=${event.id}" class="btn btn-sm btn-secondary">👥 Voir</a>
                        <a href="edit.html?id=${event.id}" class="btn btn-sm btn-secondary">✏️ Modifier</a>
                        <button onclick="deleteEvent(${event.id})" class="btn btn-sm btn-danger">🗑️ Supprimer</button>
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
            past: '<span class="badge" style="background: #6b728020; color: #6b7280;">Terminé</span>'
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
        const selectedCategory = categoryFilter.value;
        const selectedStatus = statusFilter.value;

        const filtered = allEvents.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm);
            const matchesCategory = ! selectedCategory || event.category_id == selectedCategory;
            const matchesStatus = !selectedStatus || getEventStatus(event) === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        displayEvents(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    // Fonction globale pour suppression
    window.deleteEvent = async function (id) {
        if (! confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('success', 'Événement supprimé avec succès');
                allEvents = allEvents.filter(e => e.id != id);
                applyFilters();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            showAlert('danger', 'Erreur lors de la suppression');
        }
    };
});