// public/js/attendees/delete.js
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const attendeeId = urlParams.get('id');
    
    const loading = document.getElementById('loading');
    const deleteContent = document.getElementById('deleteContent');
    const attendeeDetails = document.getElementById('attendeeDetails');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const alertContainer = document.getElementById('alert-container');

    if (!attendeeId) {
        window.location.href = 'list.html';
        return;
    }

    await loadAttendee();

    async function loadAttendee() {
        try {
            const [attendeeRes, eventsRes, locationsRes, categoriesRes] = await Promise.all([
                fetch(`/api/attendees/${attendeeId}`),
                fetch('/api/events'),
                fetch('/api/locations'),
                fetch('/api/categories')
            ]);

            const attendee = await attendeeRes.json();
            const events = await eventsRes.json();
            const locations = await locationsRes.json();
            const categories = await categoriesRes.json();

            const event = events.find(e => e.id == attendee.event_id);
            const location = event ? locations.find(l => l.id == event.location_id) : null;
            const category = event ? categories.find(c => c.id == event.category_id) : null;
            
            displayAttendeeDetails(attendee, event, location, category);
            loading.style.display = 'none';
            deleteContent.style.display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement du participant');
            console.error(error);
        }
    }

    function displayAttendeeDetails(attendee, event, location, category) {
        attendeeDetails.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: var(--danger);">Détails du participant à supprimer :</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div>
                    <strong>👤 Nom complet:</strong><br>
                    ${attendee.first_name} ${attendee.last_name}
                </div>
                <div>
                    <strong>📧 Email:</strong><br>
                    <a href="mailto:${attendee.email}" style="color: var(--primary);">${attendee.email}</a>
                </div>
                <div>
                    <strong>📞 Téléphone:</strong><br>
                    <a href="tel:${attendee.phone}" style="color: var(--primary);">${attendee.phone}</a>
                </div>
                <div>
                    <strong>📅 Date d'inscription:</strong><br>
                    ${formatDateTime(attendee.registration_date)}
                </div>
            </div>
            
            ${event ? `
                <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                    <h4 style="margin: 0 0 12px 0; color: var(--primary);">Événement associé :</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div>
                            <strong>📅 Nom:</strong><br>
                            ${event.name}
                        </div>
                        <div>
                            <strong>📅 Date de début:</strong><br>
                            ${formatDateTime(event.start_date)}
                        </div>
                        <div>
                            <strong>🏁 Date de fin:</strong><br>
                            ${formatDateTime(event.end_date)}
                        </div>
                        <div>
                            <strong>📍 Lieu:</strong><br>
                            ${location ? `${location.name}, ${location.city}` : 'Non défini'}
                        </div>
                        <div>
                            <strong>🏷️ Catégorie:</strong><br>
                            ${category ? `<span class="badge" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : 'Non définie'}
                        </div>
                    </div>
                </div>
            ` : `
                <div class="alert alert-warning">
                    <strong>⚠️ Attention :</strong> L'événement associé à ce participant n'existe plus ou a été supprimé.
                </div>
            `}
        `;
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
        const btnText = confirmDeleteBtn.querySelector('.btn-text');
        const loadingIcon = confirmDeleteBtn.querySelector('.loading');
        
        confirmDeleteBtn.disabled = true;
        btnText.style.display = 'none';
        loadingIcon.style.display = 'inline-block';
        
        try {
            const response = await fetch(`/api/attendees/${attendeeId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Participant supprimé avec succès !');
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