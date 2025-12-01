// public/js/categories/list.js
document.addEventListener('DOMContentLoaded', async function() {
    const tableBody = document.getElementById('categoriesTableBody');
    const searchInput = document.getElementById('searchInput');
    const alertContainer = document.getElementById('alert-container');

    let allCategories = [];
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
            const [categoriesRes, eventsRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/events')
            ]);

            allCategories = await categoriesRes. json();
            allEvents = await eventsRes.json();

            displayCategories(allCategories);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showAlert('danger', 'Erreur lors du chargement des données');
        }
    }

    function displayCategories(categories) {
        if (categories.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--muted);">
                        Aucune catégorie trouvée
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = categories.map(category => {
            const eventsCount = allEvents.filter(event => event.category_id == category.id).length;
            
            return `
                <tr>
                    <td>
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${category.color}; display: inline-block; border: 2px solid #e5e7eb;"></div>
                    </td>
                    <td>
                        <strong>${category.name}</strong>
                        <div style="margin-top: 4px;">
                            <span class="badge" style="background: ${category.color}20; color: ${category.color};">
                                ${category.name}
                            </span>
                        </div>
                    </td>
                    <td>${category.description || '<span style="color: var(--muted); font-style: italic;">Aucune description</span>'}</td>
                    <td>
                        ${eventsCount > 0 ?  
                            `<span class="badge badge-success">${eventsCount} événement(s)</span>` : 
                            `<span class="badge" style="background: #6b728020; color: #6b7280;">Aucun</span>`
                        }
                    </td>
                    <td>
                        <div class="table-actions">
                            <a href="edit.html?id=${category.id}" class="btn btn-sm btn-secondary">✏️ Modifier</a>
                            <button onclick="deleteCategory(${category.id}, ${eventsCount})" class="btn btn-sm btn-danger">🗑️ Supprimer</button>
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

    // Filtre de recherche
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();

        const filtered = allCategories.filter(category => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm) || 
                                (category.description && category.description. toLowerCase().includes(searchTerm));
            return matchesSearch;
        });

        displayCategories(filtered);
    }

    searchInput.addEventListener('input', applyFilters);

    // Fonction globale pour suppression
    window.deleteCategory = async function(id, eventsCount) {
        if (eventsCount > 0) {
            alert('Impossible de supprimer cette catégorie car elle est utilisée par des événements.');
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('success', 'Catégorie supprimée avec succès');
                allCategories = allCategories.filter(c => c.id != id);
                applyFilters();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            showAlert('danger', 'Erreur lors de la suppression');
        }
    };
});