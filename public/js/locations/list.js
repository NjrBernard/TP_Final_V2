document.addEventListener('DOMContentLoaded', async function() {
    const tableBody = document.getElementById('locationsTableBody');
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const alertContainer = document.getElementById('alert-container');

    let allLocations = [];
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
            const [locationsRes, eventsRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/events')
            ]);

            allLocations = await locationsRes. json();
            allEvents = await eventsRes.json();

            populateDepartmentFilter();
            displayLocations(allLocations);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showAlert('danger', 'Erreur lors du chargement des données');
        }
    }

    function populateDepartmentFilter() {
        const departments = [... new Set(allLocations.map(loc => loc. department))]. sort();
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });
    }

    function displayLocations(locations) {
        if (locations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--muted);">
                        Aucun lieu trouvé
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = locations.map(location => {
            const eventsCount = allEvents.filter(event => event.location_id == location.id).length;
            
            return `
                <tr>
                    <td><strong>${location.name}</strong></td>
                    <td>${location.city}</td>
                    <td>${location.department}</td>
                    <td>
                        <span class="badge" style="background: var(--primary)20; color: var(--primary);">
                            ${location.capacity} places
                        </span>
                    </td>
                    <td>
                        ${eventsCount > 0 ? 
                            `<span class="badge badge-success">${eventsCount} événement(s)</span>` : 
                            `<span class="badge" style="background: #6b728020; color: #6b7280;">Aucun</span>`
                        }
                    </td>
                    <td>
                        <div class="table-actions">
                            <a href="edit.html?id=${location.id}" class="btn btn-sm btn-secondary">✏️ Modifier</a>
                            <button onclick="deleteLocation(${location. id}, ${eventsCount})" class="btn btn-sm btn-danger">🗑️ Supprimer</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
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
        const selectedDepartment = departmentFilter. value;

        const filtered = allLocations.filter(location => {
            const matchesSearch = location.name.toLowerCase().includes(searchTerm) || 
                                location.city. toLowerCase().includes(searchTerm);
            const matchesDepartment = ! selectedDepartment || location.department === selectedDepartment;

            return matchesSearch && matchesDepartment;
        });

        displayLocations(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    departmentFilter.addEventListener('change', applyFilters);

    // Fonction globale pour suppression
    window.deleteLocation = async function(id, eventsCount) {
        if (eventsCount > 0) {
            alert('Impossible de supprimer ce lieu car il est utilisé par des événements.');
            return;
        }

        if (! confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) return;

        try {
            const response = await fetch(`/api/locations/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('success', 'Lieu supprimé avec succès');
                allLocations = allLocations.filter(l => l.id != id);
                applyFilters();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            showAlert('danger', 'Erreur lors de la suppression');
        }
    };
});