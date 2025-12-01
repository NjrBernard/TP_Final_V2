// public/js/events/delete.js
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    const loading = document.getElementById('loading');
    const deleteContent = document.getElementById('deleteContent');
    const eventDetails = document. getElementById('eventDetails');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const alertContainer = document.getElementById('alert-container');

    if (!eventId) {
        window.location.href = 'list.html';
        return;
    }

    await loadEvent();

    async function loadEvent() {
        try {
            const [eventRes, categoriesRes, locationsRes, attendeesRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch('/api/categories'),
                fetch('/api/locations'),
                fetch('/api/attendees')
            ]);

            const event = await eventRes.json();
            const categories = await categoriesRes.json();
            const locations = await locationsRes.json();
            const attendees = await attendeesRes.json();

            const eventAttendees = attendees.filter(a => a.event_id == eventId);
            
            displayEventDetails(event, categories, locations, eventAttendees);
            loading.style.display = 'none';
            deleteContent.style. display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement de l\'événement');
            console.error(error);
        }
    }

    function displayEventDetails(event, categories, locations, eventAttendees) {
        const category = categories.find(c => c.id == event.category_id);
        const location = locations.find(l => l.id == event.location_id);

        eventDetails.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: var(--danger);">Détails de l'événement à supprimer :</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
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
                    ${location ?  `${location.name}, ${location. city}` : 'Non défini'}
                </div>
                <div>
                    <strong>🏷️ Catégorie:</strong><br>
                    ${category ? `<span class="badge" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : 'Non définie'}
                </div>
                <div>
                    <strong>👥 Participants inscrits:</strong><br>
                    <span class="badge ${eventAttendees.length > 0 ? 'badge-warning' : ''}" style="${eventAttendees.length === 0 ? 'background: #6b728020; color: #6b7280;' : ''}">${eventAttendees.length} participant(s)</span>
                </div>
            </div>
            ${event.description ? `
                <div style="margin-bottom: 16px;">
                    <strong>📝 Description:</strong><br>
                    ${event.description}
                </div>
            ` : ''}
            ${eventAttendees.length > 0 ? `
                <div class="alert alert-warning">
                    <strong>⚠️ Participants inscrits :</strong><br>
                    Les ${eventAttendees.length} participant(s) suivant(s) seront également supprimés :
                    <ul style="margin: 8px 0 0 20px;">
                        ${eventAttendees.map(attendee => `<li>${attendee.first_name} ${attendee.last_name} (${attendee.email})</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
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
            alertContainer. innerHTML = '';
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
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Événement supprimé avec succès ! ');
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
            loadingIcon.style. display = 'none';
        }
    });
});