// public/js/categories/delete.js
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location. search);
    const categoryId = urlParams.get('id');
    
    const loading = document.getElementById('loading');
    const deleteContent = document.getElementById('deleteContent');
    const categoryDetails = document.getElementById('categoryDetails');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const alertContainer = document.getElementById('alert-container');

    if (!categoryId) {
        window.location.href = 'list.html';
        return;
    }

    await loadCategory();

    async function loadCategory() {
        try {
            const [categoryRes, eventsRes] = await Promise.all([
                fetch(`/api/categories/${categoryId}`),
                fetch('/api/events')
            ]);

            const category = await categoryRes.json();
            const events = await eventsRes.json();

            const categoryEvents = events.filter(e => e.category_id == categoryId);
            
            displayCategoryDetails(category, categoryEvents);
            loading.style.display = 'none';
            deleteContent.style. display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement de la catégorie');
            console. error(error);
        }
    }

    function displayCategoryDetails(category, categoryEvents) {
        categoryDetails. innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: var(--danger);">Détails de la catégorie à supprimer :</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div>
                    <strong>🏷️ Nom:</strong><br>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${category.color}; border: 2px solid #e5e7eb;"></div>
                        <span class="badge" style="background: ${category. color}20; color: ${category.color};">
                            ${category.name}
                        </span>
                    </div>
                </div>
                <div>
                    <strong>🎨 Couleur:</strong><br>
                    ${category.color}
                </div>
                <div>
                    <strong>📅 Événements:</strong><br>
                    <span class="badge ${categoryEvents.length > 0 ? 'badge-danger' : ''}" style="${categoryEvents.length === 0 ? 'background: #6b728020; color: #6b7280;' : ''}">${categoryEvents.length} événement(s)</span>
                </div>
            </div>
            ${category.description ? `
                <div style="margin-bottom: 16px;">
                    <strong>📝 Description:</strong><br>
                    ${category.description}
                </div>
            ` : ''}
            ${categoryEvents.length > 0 ? `
                <div class="alert alert-danger">
                    <strong>⚠️ Événements associés :</strong><br>
                    Cette catégorie est utilisée par ${categoryEvents.length} événement(s).  Vous ne pouvez pas la supprimer :
                    <ul style="margin: 8px 0 0 20px;">
                        ${categoryEvents.map(event => `<li>${event.name} - ${formatDateTime(event.start_date)}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 12px;"><strong>Veuillez d'abord supprimer ou changer la catégorie de ces événements.</strong></p>
                </div>
            ` : ''}
        `;

        // Désactiver le bouton de suppression s'il y a des événements
        if (categoryEvents.length > 0) {
            confirmDeleteBtn. disabled = true;
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
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Catégorie supprimée avec succès ! ');
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